import { Token } from "../Main";
import { useEthers, useTokenBalance, useTokenAllowance } from "@usedapp/core";
import networkMapping from "../../chain-info/map.json";
import { formatUnits } from "@ethersproject/units";
import { BalanceMsg } from "../../components";
import { constants } from "ethers";

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
        </div>
    );
};
