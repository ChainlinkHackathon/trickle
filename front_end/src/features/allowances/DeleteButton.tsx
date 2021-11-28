import Button from "@mui/material/Button";
import { useTrickle } from "../../hooks";
import { CircularProgress } from "@material-ui/core";

export function DeleteButton(params: any) {
    const { deleteOrderSend, deleteOrderState } = useTrickle();
    const isMining = deleteOrderState.status === "Mining";
    async function handleClick() {
        const tokenPairHash = params.getValue(params.id, "tokenPairHash");
        const orderHash = params.getValue(params.id, "orderHash");
        console.log("Deleting", tokenPairHash, orderHash);
        await deleteOrderSend(tokenPairHash, orderHash);
        console.log("Deleted");
    }

    return (
        <Button variant="outlined" color="error" onClick={handleClick}>
            {isMining ? <CircularProgress size={26} /> : "Delete"}
        </Button>
    );
}
