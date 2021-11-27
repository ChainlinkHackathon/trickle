import { useEffect, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import abi from "../chain-info/Trickle.json";
import { utils, constants, BigNumber } from "ethers";
import { Contract } from "@ethersproject/contracts";
import networkMapping from "../chain-info/map.json";

export const useTrickle = () => {
    const { chainId } = useEthers();
    const trickleContractAddress = chainId
        ? networkMapping[String(chainId)]["Trickle"]
        : constants.AddressZero;


    console.log("ADDRESS:", trickleContractAddress);

    const trickleContract = new Contract(
        trickleContractAddress,
        abi
    );

    const { send: setDcaSend, state: setDcaState } = useContractFunction(
        trickleContract,
        "setRecurringOrder",
        {
            transactionName: "Set DCA",
        }
    );

    const send = async (
        sellToken: string,
        buyToken: string,
        amount: BigNumber,
        interval: number | string | Array<number | string>
    ) => {
        console.log("dcaInterval:", interval);
        console.log("amount:", amount);
        console.log("sellToken:", sellToken);
        console.log("buyToken:", buyToken);
        await setDcaSend(sellToken, buyToken, amount, interval);
        console.log("State:", setDcaState);
    };

    const [state, setState] = useState(setDcaState);

    useEffect(() => {
        setState(setDcaState);
    }, [setDcaState]);

    return { send, state };
};
