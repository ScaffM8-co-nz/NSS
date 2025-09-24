import React, { useState } from "react";
import { PlusCircleIcon, PencilAltIcon, CheckIcon } from "@heroicons/react/outline";
import moment from "moment";
import { Button, Table, Spinner } from "../../common";
import { JobsApi } from "../../api";
import { CreateEditDayWorkTask } from './CreateEditDayWorkTask';

export function DayWorkTask({ job_ID }) {
    const [open, setOpen] = useState(false);

    const [dayworktaskID, setDayWorkTaskID] = useState(null);

    const tasksQuery = JobsApi.useFetchDayWorkTask(job_ID);

    const createEDinvoiceMutation = JobsApi.useCreateEdInvoice();
    const updateTaskMutation = JobsApi.useUpdateTask();

    if (tasksQuery.isLoading) {
        return (
            <div className="w-full h-48 flex justify-center items-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!tasksQuery.data) return null;

    return (
        <div className="w-full mx-auto mt-8">
            <div>
                <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">
                    Day Work Task
                </h2>
                <div className="px-8 py-2">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => { setDayWorkTaskID(null); setOpen(true); }}
                        startIcon={<PlusCircleIcon className="w-4 h-4" />}
                    >
                        Create Day Work Task
                    </Button>
                </div>

                <Table
                    cols={[
                        {
                            Header: "id",
                            accessor: "task_id"
                        },
                        {
                            Header: "Last Updated",
                            accessor: "created_at",
                            Cell: ({ row }) => (
                                `${moment(row.values.created_at).format("MMMM Do YYYY")}`
                            )
                        },
                        {
                            Header: "Description",
                            accessor: "description"
                        },
                        {
                            Header: "Requester",
                            accessor: "Requester",
                        },
                        {
                            Header: "Workers",
                            accessor: "Workers"
                        },
                        {
                            Header: "Hours",
                            accessor: "total_hours"
                        },
                        {
                            Header: "Rate",
                            accessor: "Rate",
                            Cell: ({ row }) =>
                                `$${Number(row.values.Rate).toFixed(2)}`
                        },
                        {
                            Header: "Total",
                            accessor: "total_Daywork",
                            Cell: ({ row }) =>
                                `$${Number(row.values.total_Daywork).toFixed(2)}`
                        },
                        {
                            Header: "Photo of slip",
                            accessor: "photo_of_slip",
                            Cell: ({ row }) => (
                                row.values.photo_of_slip ? <a href={row.values.photo_of_slip}>Url</a> : <> </>
                            )
                        },
                        {
                            Header: "PO Number",
                            accessor: "PO_Number",
                        },
                        {
                            Header: "Pink slip number",
                            accessor: "pink_slip_number",
                        },
                        {
                            Header: "Approve",
                            Cell: ({ row }) => (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (row.original.EdInvoiced_Created) {
                                            return
                                        }
                                        const edInvoicePayload = {
                                            "zone": "",
                                            "zone_label": "Day Work Task",
                                            "type": "",
                                            "description": row?.original?.description || "",
                                            "erect_percent": 100,
                                            "erect": 100,
                                            "dismantle_percent": 100,
                                            "dismantle": 100,
                                            "ed_total": row?.original?.total_Daywork || 0,
                                            "complete_percent": 100,
                                            "invoiced": row?.original?.total_Daywork || 0,
                                            "job_id": row?.original?.job_id || null,
                                            "balance": row?.original?.total_Daywork ||0,
                                            "status": "Pending",
                                            "task_id": row?.original?.id || null,
                                            "PO_Number": row?.original?.PO_Number || "",
                                            "Quote_Number": "",
                                            "xeroReference": "",
                                        };
                                        createEDinvoiceMutation.mutateAsync(edInvoicePayload);
                                        updateTaskMutation.mutateAsync({
                                            payload: { "EdInvoiced_Created": true },
                                            taskId: row.original.id,
                                        });
                                    }}
                                >
                                    {!row.original.EdInvoiced_Created && <CheckIcon className="text-gray-600 h-4 w-4" />}
                                </button>
                            ),
                        },
                        {
                            Header: "Edit",
                            accessor: "id",
                            Cell: ({ row }) => (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDayWorkTaskID(row.values.id);
                                        setOpen(true);
                                    }}
                                >
                                    <PencilAltIcon className="text-gray-600 h-4 w-4" />
                                </button>
                            ),
                        }
                    ]}
                    tableData={tasksQuery.data}
                />

            </div>
            {open ?
                <CreateEditDayWorkTask job_id={job_ID} DayWorkTaskID={dayworktaskID} set={setDayWorkTaskID} open={open} setOpen={setOpen} />
                : <br />}
        </div>
    )
}