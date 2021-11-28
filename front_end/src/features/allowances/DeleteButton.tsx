import Button from '@mui/material/Button';
import { useTrickle } from "../../hooks";

export function DeleteButton(params: any) {

    const { deleteOrderSend } = useTrickle();
    async function handleClick() {
        const tokenPairHash = params.getValue(params.id, "tokenPairHash")
        const orderHash = params.getValue(params.id, "orderHash")
        console.log("Deleting", tokenPairHash, orderHash);
        await deleteOrderSend(tokenPairHash, orderHash);
        console.log("Deleted");
    }


    return (
        <Button variant="outlined" color="error" onClick={handleClick}>Delete</Button>
    );
}
