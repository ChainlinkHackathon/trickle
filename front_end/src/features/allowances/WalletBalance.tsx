import { Token } from '../Main';
import {
  useEthers,
  useTokenBalance,
  useTokenAllowance,
  useContractFunction
} from '@usedapp/core';
import networkMapping from '../../chain-info/map.json';
import { formatUnits } from '@ethersproject/units';
import { BalanceMsg } from '../../components';
import { constants, Contract } from 'ethers';
import { Button } from '@material-ui/core';
import ERC20 from '../../chain-info/ERC20.json';

export interface WalletBalanceProps {
  token: Token;
}

export const WalletBalance = ({ token }: WalletBalanceProps) => {
  const { image, address, name } = token;

  const { account, chainId } = useEthers();
  const tokenBalance = useTokenBalance(address, account);
  const formattedTokenBalance: number = tokenBalance
    ? parseFloat(formatUnits(tokenBalance, 18))
    : 0;

  const contractMapping = networkMapping[String(chainId)];
  const spenderAddress = contractMapping?.Counter ?? constants.AddressZero;
  const tokenAllowance = useTokenAllowance(address, account, spenderAddress);
  const formattedTokenAllowance: number = tokenAllowance
    ? parseFloat(formatUnits(tokenAllowance, 18))
    : 0;

  const availableBalance = tokenAllowance
    ? tokenAllowance.lt(tokenBalance ?? 0)
      ? tokenAllowance
      : tokenBalance
    : 0;
  const formattedAvailableBalance: number = availableBalance
    ? parseFloat(formatUnits(availableBalance, 18))
    : 0;

  const tokenContract = new Contract(address, ERC20.abi);

  const { state, send } = useContractFunction(tokenContract, 'approve', {
    transactionName: 'Approve'
  });
  async function approveMax() {
    console.log('Approving Max');
    await send(spenderAddress, constants.MaxUint256);
    console.log('Transaction status: ', state);
  }

  return (
    <div>
      <div className="row">
        <BalanceMsg
          label={`${name} balance in connected account`}
          amount={formattedTokenBalance}
          tokenImgSrc={image}
        />
      </div>
      <div className="row">
        <BalanceMsg
          label={`${name} allowance approved to be spent by contract`}
          amount={formattedTokenAllowance}
          tokenImgSrc={image}
        />
      </div>
      <div className="row">
        <BalanceMsg
          label={`${name} balance available for DCA`}
          amount={formattedAvailableBalance}
          tokenImgSrc={image}
        />
      </div>
      <div className="row">
        <Button
          color="primary"
          variant="contained"
          onClick={() => approveMax()}
        >
          Approve Maximum Allowance
        </Button>
      </div>
    </div>
  );
};
