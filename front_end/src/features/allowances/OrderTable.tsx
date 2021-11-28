import { DataGrid } from "@mui/x-data-grid";
import { useTrickle } from "../../hooks";
import { useEffect } from "react";

const columns = [
    { field: "sellToken", headerName: "Sell Token", width: 130 },
    { field: "buyToken", headerName: "Buy Token", width: 400 },
    {
        field: "sellAmount",
        headerName: "Amount",
        type: "number",
        width: 90,
    },
    {
        field: "interval",
        headerName: "interval",
        type: "number",
        width: 90,
    },
    {
        field: "lastExecution",
        headerName: "Last Execution",
        type: "number",
        width: 90,
    },
];

export function OrderTable() {
    const { orders } = useTrickle();
    const rows = orders
        ? orders[0].map((order: any, i: number) => {
              return { id: i, ...order };
          })
        : [];

    useEffect(() => {
        console.log("rows", rows);
    }, [rows]);

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
