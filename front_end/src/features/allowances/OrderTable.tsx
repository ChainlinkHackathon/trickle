import { DataGrid } from "@mui/x-data-grid";
import { useTrickle } from "../../hooks";
import { useEffect, useMemo } from "react";
import { utils } from "ethers";
import { DeleteButton } from "./DeleteButton";

const columns = [
    { field: "sellToken", headerName: "Sell Token", width: 150 },
    { field: "buyToken", headerName: "Buy Token", width: 150 },
    {
        field: "sellAmountFormatted",
        headerName: "Amount",
        type: "number",
        width: 90,
        valueGetter: (params: any) =>
            utils.formatEther(params.getValue(params.id, "sellAmount")),
    },
    {
        field: "interval",
        headerName: "interval",
        type: "number",
        width: 90,
    },
    {
        field: "lastExecutionFormatted",
        headerName: "Last Execution",
        type: "string",
        width: 150,
        valueGetter: (params: any) => {
            const rawValue = params
                .getValue(params.id, "lastExecution")
                .toNumber();
            if (rawValue === 0) {
                return "NONE";
            } else {
                const date = new Date(rawValue * 1000);
                return date.toLocaleString();
            }
        },
    },
    {
        field: "nextExecution",
        headerName: "Next Execution",
        type: "string",
        width: 150,
        valueGetter: (params: any) => {
            const rawValue = params
                .getValue(params.id, "lastExecution")
                .add(params.getValue(params.id, "interval"))
                .toNumber();
            const date = new Date(rawValue * 1000);
            const now = new Date();
            if (date < now) {
                return "NOW";
            } else {
                return date.toLocaleString();
            }
        },
    },
    {
        field: "delete",
        headerName: "Delete",
        sortable: false,
        renderCell: DeleteButton,
    },
];

export function OrderTable() {
    const { orders } = useTrickle();
    const rows = useMemo(
        () =>
            orders
                ? orders[0].map((order: any, i: number) => {
                      return { id: i, ...order };
                  })
                : [],
        [orders]
    );

    useEffect(() => {
        console.log("rows", rows);
    }, [rows]);

    return (
        <div style={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columns as any}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
        </div>
    );
}
