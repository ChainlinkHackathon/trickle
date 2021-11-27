import { DataGrid } from "@mui/x-data-grid";

const columns = [
    { field: "sellToken", headerName: "Sell Token", width: 130 },
    { field: "buyToken", headerName: "Buy Token", width: 400 },
    {
        field: "amount",
        headerName: "amount",
        type: "number",
        width: 90,
    },
    {
        field: "interval",
        headerName: "interval",
        type: "number",
        width: 90,
    },
];

const rows = [
    {
        id: 1,
        buyToken: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
        sellToken: "Dai",
        amount: 35,
        interval: 1000,
    },
    {
        id: 2,
        buyToken: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
        sellToken: "Weth",
        amount: 10,
        interval: 1000,
    },
    {
        id: 3,
        buyToken: "0xad5ce863ae3e4e9394ab43d4ba0d80f419f61789",
        sellToken: "Dai",
        amount: 45,
        interval: 1000,
    },
];

export function OrderTable() {
    return (
        <div style={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
        </div>
    );
}
