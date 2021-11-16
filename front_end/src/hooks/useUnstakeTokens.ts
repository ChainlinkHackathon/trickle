import { useContractFunction, useEthers } from "@usedapp/core"
import Counter from "../chain-info/TokenFarm.json"
import { utils, constants } from "ethers"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/map.json"

/**
 * Expose { send, state } object to facilitate unstaking the user's tokens from the TokenFarm contract
 */
export const useUnstakeTokens = () => {
  const { chainId } = useEthers()

  const { abi } = Counter
  const tokenFarmContractAddress = chainId ? networkMapping[String(chainId)]["Counter"][0] : constants.AddressZero

  const tokenFarmInterface = new utils.Interface(abi)

  const tokenFarmContract = new Contract(
    tokenFarmContractAddress,
    tokenFarmInterface
  )

  return useContractFunction(tokenFarmContract, "unstakeTokens", {
    transactionName: "Unstake tokens",
  })
}
