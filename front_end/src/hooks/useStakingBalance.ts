import { useContractCall, useEthers } from "@usedapp/core"
import Counter from "../chain-info/TokenFarm.json"
import { utils, BigNumber, constants } from "ethers"
import networkMapping from "../chain-info/map.json"

/**
 * Get the staking balance of a certain token by the user in our TokenFarm contract
 * @param address - The contract address of the token
 */
export const useStakingBalance = (address: string): BigNumber | undefined => {
  const { account, chainId } = useEthers()

  const { abi } = Counter
  const tokenFarmContractAddress = chainId ? networkMapping[String(chainId)]["Counter"][0] : constants.AddressZero

  const tokenFarmInterface = new utils.Interface(abi)

  const [stakingBalance] =
    useContractCall({
      abi: tokenFarmInterface,
      address: tokenFarmContractAddress,
      method: "stakingBalance",
      args: [address, account],
    }) ?? []

  return stakingBalance
}
