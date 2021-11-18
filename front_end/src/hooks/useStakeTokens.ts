import { useEffect, useState } from 'react'
import { useContractFunction, useEthers } from '@usedapp/core'
import Trickle from '../chain-info/Trickle.json'
import { utils, constants } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import networkMapping from '../chain-info/map.json'

export const useStakeTokens = () => {
  const { chainId } = useEthers()
  const { abi } = Trickle
  const tokenFarmContractAddress = chainId
    ? networkMapping[String(chainId)]['Trickle'][0]
    : constants.AddressZero

  const tokenFarmInterface = new utils.Interface(abi)

  const tokenFarmContract = new Contract(
    tokenFarmContractAddress,
    tokenFarmInterface
  )

  const { send: stakeTokensSend, state: stakeTokensState } =
    useContractFunction(tokenFarmContract, 'fundContract', {
      transactionName: 'Fund Contract',
    })

  const [amountToStake, setAmountToStake] = useState('0')
  const [dcaInterval, setDcaInterval] = useState('0')

  const send = (amount: string, interval: string) => {
    setAmountToStake(amount)
    setDcaInterval(interval)
    console.log('dcaInterval:', interval)
    console.log('amount:', amount)
    return stakeTokensSend(amountToStake, dcaInterval)
  }

  const [state, setState] = useState(stakeTokensState)

  useEffect(() => {
    setState(stakeTokensState)
  }, [stakeTokensState])

  return { send, state }
}
