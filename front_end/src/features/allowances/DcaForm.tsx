import { useEffect, useState } from "react";
import { SliderInput } from "../../components";
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core";
import { formatUnits } from "@ethersproject/units";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import { Tab, makeStyles, Box } from "@material-ui/core";
import { Token } from "../Main";
import { useTrickle } from "../../hooks";
import { utils } from "ethers";
import Alert from "@material-ui/lab/Alert";
import { NormalInput } from "../../components/NormalInput";
import { TextField } from "@material-ui/core";

// This is the typescript way of saying this compent needs this type
export interface DcaFormProps {
    token: Token;
}

const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(2),
        width: "100%",
    },
    boxWrapper: {
        display: "flex",
        // flexDirection: 'column',
        alignItems: "center",
        justifyContent: "space-around",
        gap: theme.spacing(2),
        width: "100%",
    },
    box: {
        backgroundColor: "rgba(0, 0, 0, 0.06)",
        borderRadius: "25px",
        width: "50%",
        display: "flex",
        padding: "20px",
        // justifyContent: 'center',
        // alignContent: 'center'
    },
    slider: {
        width: "100%",
        maxWidth: "400px",
        padding: "10px 26px",
    },
}));

// token is getting passed in as a prop
// in the ping brackets is an object/variable
// That object is of the shape DcaFormProps
export const DcaForm = ({ token }: DcaFormProps) => {
    const { image, address: tokenAddress, name } = token;

    const { account } = useEthers();
    const tokenBalance = useTokenBalance(tokenAddress, account);
    const { notifications } = useNotifications();

    const classes = useStyles();

    const { send: setDcaSend, state: setDcaState } = useTrickle();

    const formattedTokenBalance: number = tokenBalance
        ? parseFloat(formatUnits(tokenBalance, 18))
        : 0;

    const handleDcaSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString());
        return setDcaSend(
            tokenAddress,
            buyToken,
            amountAsWei,
            interval.toString()
        );
    };

    const [buyToken, setBuyToken] = useState<string>(
        "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789"
    );
    const handleBuyTokenChange = (event: any) => {
        setBuyToken(event.target.value);
    };

    const [amount, setAmount] = useState<
        number | string | Array<number | string>
    >(0);

    const [interval, setInterval] = useState<
        number | string | Array<number | string>
    >(0);

    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] =
        useState(false);
    const [showDcaTokensSuccess, setshowDcaTokensSuccess] = useState(false);

    const handleCloseSnack = () => {
        showErc20ApprovalSuccess && setShowErc20ApprovalSuccess(false);
        showDcaTokensSuccess && setshowDcaTokensSuccess(false);
    };

    useEffect(() => {
        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "Approve ERC20 transfer"
            ).length > 0
        ) {
            !showErc20ApprovalSuccess && setShowErc20ApprovalSuccess(true);
            showDcaTokensSuccess && setshowDcaTokensSuccess(false);
        }

        if (
            notifications.filter(
                (notification) =>
                    notification.type === "transactionSucceed" &&
                    notification.transactionName === "DCA tokens"
            ).length > 0
        ) {
            showErc20ApprovalSuccess && setShowErc20ApprovalSuccess(false);
            !showDcaTokensSuccess && setshowDcaTokensSuccess(true);
        }
    }, [notifications, showErc20ApprovalSuccess, showDcaTokensSuccess]);

    const isMining = setDcaState.status === "Mining";

    const hasZeroBalance = formattedTokenBalance === 0;
    const hasZeroAmountSelected = parseFloat(amount.toString()) === 0;

    return (
        <>
            <div className={classes.boxWrapper}>
                <Box className={classes.box}>
                    {/* <div className={classes.container}> */}
                    <NormalInput
                        label={`${name}`}
                        maxValue={formattedTokenBalance}
                        id={`amount-slider-input-${name}`}
                        tokenImgSrc={image}
                        className={classes.slider}
                        value={amount}
                        onChange={setAmount}
                        disabled={isMining || hasZeroBalance}
                    />
                    {/* </div> */}
                </Box>
            </div>
            <div className={classes.container}>
                <SliderInput
                    //   label={'DCA Interval'}
                    // TODO: week by default add field to change this
                    maxValue={30}
                    id={`interval-slider-input-${name}`}
                    className={classes.slider}
                    value={interval}
                    onChange={setInterval}
                    disabled={isMining || hasZeroBalance}
                />
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    onClick={handleDcaSubmit}
                    disabled={isMining || hasZeroAmountSelected}
                >
                    {isMining ? (
                        <CircularProgress size={26} />
                    ) : (
                        "Set Recurring Purchase"
                    )}
                </Button>
            </div>
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer approved successfully! Now approve the
                    2nd tx to initiate the staking transfer.
                </Alert>
            </Snackbar>
            <Snackbar
                open={showDcaTokensSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}
            >
                <Alert onClose={handleCloseSnack} severity="success">
                    Recurring buy set successfully!
                </Alert>
            </Snackbar>
        </>
    );
};
