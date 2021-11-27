import { useEthers } from "@usedapp/core";
import { makeStyles, Box } from "@material-ui/core";
import { DcaForm } from "./DcaForm";
import { OrderTable } from "./OrderTable";
import { ConnectionRequiredMsg } from "../../components";
import { Token } from "../Main";

interface AllowancesProps {
    supportedTokens: Array<Token>;
}

const useStyles = makeStyles((theme) => ({
    tabContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(4),
    },
    box: {
        backgroundColor: "white",
        borderRadius: "25px",
    },
    header: {
        color: "white",
    },
}));

export const Allowances = ({ supportedTokens }: AllowancesProps) => {
    // wtf is this?
    // Reacts way of holding state between components
    // Could do it without <number>
    // saving state between renders of components
    // You'd have to pass it through as a prop to have another component use it

    const { account } = useEthers();

    const isConnected = account !== undefined;

    const classes = useStyles();

    return (
        <Box>
            <h1 className={classes.header}>Create Recurring Order</h1>
            <Box className={classes.box}>
                <div>
                    {isConnected ? (
                        <div className={classes.tabContent}>
                            <DcaForm supportedTokens={supportedTokens}/>
                        </div>
                    ) : (
                        <ConnectionRequiredMsg />
                    )}
                </div>
            </Box>
            <h1 className={classes.header}>Existing Orders</h1>
            <Box className={classes.box}>
                <div>
                    {isConnected ? (
                        <div className={classes.tabContent}>
                            <OrderTable/>
                        </div>
                    ) : (
                        <ConnectionRequiredMsg />
                    )}
                </div>
            </Box>
        </Box>
    );
};
