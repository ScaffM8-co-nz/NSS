import React, { useEffect, useState } from "react";
import { PlusCircleIcon, PencilAltIcon, DuplicateIcon, SortAscendingIcon } from "@heroicons/react/outline";
import moment from "moment";
import { ConfirmationDialog } from "../../common/Confirmation/Confirmation";
import { Button, Table, Spinner, Badge } from "../../common";
import { JobsApi } from "../../api";
import { CreateEditEdInvoice } from './CreateEditEdInvoice';

export function EDInvoices({ job_ID }) {
    const createEdInvoiceMutation = JobsApi.useCreateEdInvoice();
    const [quotesQuery, setQuotesQuery] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);

    const [edinvoiceID, setEDinvoiceID] = useState(null);

    useEffect(() => {
        if (loading && quotesQuery.length === 0) {
            JobsApi.fetchEdInvoices(job_ID).then((data) => {
                setQuotesQuery(data);
                setLoading(false);
            });
        }
    });

    if (loading && quotesQuery.length === 0) {
        return (
            <div className="w-full h-48 flex justify-center items-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="w-full mx-auto mt-8">
            <div>
                <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">
                    ED Invoices
                </h2>
                <div className="px-8 py-2">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => { setEDinvoiceID(null); setOpen(true); }}
                        startIcon={<PlusCircleIcon className="w-4 h-4" />}
                    >
                        Create Ed Invoice
                    </Button>
                </div>

                <Table
                sortby="zone"
                    cols={[
                        {
                            Header: "Zone",
                            accessor: "zone",
                        },
                        {
                            Header: "Zone Label",
                            accessor: "zone_label"
                        },
                        {
                            Header: "Type",
                            accessor: "type"
                        },
                        {
                            Header: "Description",
                            accessor: "description"
                        },
                        {
                            Header: "Erect cost",
                            accessor: "erect",
                            Cell: ({ row }) => (
                                `$${row.values.erect.toFixed(2)}`
                            )
                        },
                        {
                            Header: "% completion erect",
                            accessor: "erect_percent",
                            Cell: ({ row }) => (
                                `${row.values.erect_percent}%`
                            )
                        },
                        {
                            Header: "Dismantle cost",
                            accessor: "dismantle",
                            Cell: ({ row }) => (
                                `$${row.values.dismantle.toFixed(2)}`
                            )
                        },
                        {
                            Header: "% completion dismantle",
                            accessor: "dismantle_percent",
                            Cell: ({ row }) => (
                                `${row.values.dismantle_percent}%`
                            )
                        },
                        {
                            Header: "ED Total",
                            accessor: "ed_total",
                            Cell: ({ row }) => (
                                `$${row.values.ed_total.toFixed(2)}`
                            )
                        },
                        {
                            Header: "% Complete",
                            accessor: "complete_percent",
                            Cell: ({ row }) => (
                                `${row.values.complete_percent}%`
                            )
                        },
                        {
                            Header: "invoice",
                            accessor: "invoiced",
                            Cell: ({ row }) => (
                                `$${row.values.invoiced.toFixed(2)}`
                            )
                        },
                        {
                            Header: "balance",
                            accessor: "balance",
                            Cell: ({ row }) => (
                                `$${row.values.balance.toFixed(2)}`
                            )
                        },
                        {
                            Header: "PO Number",
                            accessor: "PO_Number",
                        },
                        {
                            Header: "Quote",
                            accessor: "Quote_Number",
                        },
                        {
                            Header: "Duplicate",
                            Cell: ({ row }) => (
                                <ConfirmationDialog
                                    isDone={createEdInvoiceMutation?.isSuccess}
                                    icon="info"
                                    title="Duplicate ED Invoice"
                                    body="Duplicating this ED invoice will create a copy of this record."
                                    triggerButton={
                                        <button type="button">
                                            <DuplicateIcon className="h-4 w-4 text-gray-600" />
                                        </button>
                                    }
                                    confirmButton={
                                        <Button
                                            isLoading={createEdInvoiceMutation?.isLoading}
                                            variant="primary"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                const newData = {
                                                    ...row.values,
                                                    job_id: Number(job_ID)
                                                };
                                                newData.last_invoice = row.values.invoiced
                                                delete newData.Duplicate;
                                                delete newData.id;
                                                try {
                                                    await createEdInvoiceMutation.mutateAsync(newData);
                                                    createEdInvoiceMutation.isSuccess = true;
                                                } catch (err) {
                                                    console.log("ERROR DUPLICATING INVOICE", err);
                                                }
                                            }}
                                        >
                                            Duplicate Ed Invoice
                                        </Button>
                                    }
                                />
                            )
                        },
                        {
                            Header: "Edit",
                            accessor: "id",
                            Cell: ({ row }) => (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEDinvoiceID(row.values.id);
                                        setOpen(true);
                                    }}
                                >
                                    <PencilAltIcon className="text-gray-600 h-4 w-4" />
                                </button>
                            ),
                        },
                        {
                            Header: "Last Time Updated",
                            accessor: "last_time_updated",
                            Cell: ({ row }) => (
                                `${moment(row.values.last_time_updated).format("MMMM Do YYYY")}`
                                // .format("MMMM Do YYYY, h:mm a")
                            )
                        }
                    ]}
                    tableData={quotesQuery}
                />

            </div>
            {open ?
                <CreateEditEdInvoice job_id={job_ID} edinvoiceID={edinvoiceID} setEDinvoiceID={setEDinvoiceID} open={open} setOpen={setOpen} />
                : <br />}
        </div>
    )
}