import { useEffect, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import abi from "../chain-info/Trickle.json";
import { utils, constants } from "ethers";
import { Contract } from "@ethersproject/contracts";
import networkMapping from "../chain-info/map.json";

export const useTrickle = () => {
    const { chainId } = useEthers();
    const trickleContractAddress = chainId
        ? networkMapping[String(chainId)]["Trickle"]
        : constants.AddressZero;

    const trickleInterface = new utils.Interface(abi);

    console.log("ADDRESS:", trickleContractAddress);

    const trickleContract = new Contract(
        trickleContractAddress,
        trickleInterface
    );

    const { send: setDcaSend, state: setDcaState } = useContractFunction(
        trickleContract,
        "setRecurringOrder",
        {
            transactionName: "Set DCA",
        }
    );

    const [amountToDca, setAmountToDca] = useState("0");
    const [dcaInterval, setDcaInterval] = useState("0");

    const send = (
        sellToken: string,
        buyToken: string,
        amount: string,
        interval: string
    ) => {
        setAmountToDca(amount);
        setDcaInterval(interval);
        console.log("dcaInterval:", interval);
        console.log("amount:", amount);
        console.log("sellToken:", sellToken);
        console.log("buyToken:", buyToken);
        return setDcaSend(sellToken, buyToken, amountToDca, dcaInterval);
    };

    const [state, setState] = useState(setDcaState);

    useEffect(() => {
        setState(setDcaState);
    }, [setDcaState]);

    return { send, state };
};
