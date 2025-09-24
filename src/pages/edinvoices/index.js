import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { PencilAltIcon, DuplicateIcon, XIcon } from "@heroicons/react/solid";
import moment from "moment";
import { ConfirmationDialog } from "../../common/Confirmation/Confirmation";
import { PageHeading, Button, Spinner, XeroStatus } from "../../common";
import { CreateEditEdInvoice } from "../../components/Jobs/CreateEditEdInvoice";
import { Container } from "../../utils";
import { EndOfMonth } from "../../components/EDInvoices";
import { JobsApi } from "../../api";
import { useNotificationStore } from "../../store/notifications";

export const EdInvoicesMain = () => {
    const { addNotification } = useNotificationStore();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoicesSelected, setInvoicesSelected] = useState(null)

    const [job_idToEdit, setJob_idToEdit] = useState(null);
    const [edinvoiceIDToEdit, setEdinvoiceIDToEdit] = useState(null);
    const [openToEdit, setOpenToEdit] = useState(false);

    const createEdInvoiceMutation = JobsApi.useCreateEdInvoice();
    const updateEdInvoiceMutation = JobsApi.useUpdateEdInvoice();
    const deleteEdInvoiceMutation = JobsApi.useDeleteDayWorkTask();

    const dt = React.useRef(null);
    useEffect(() => {
        if (loading && invoices.length === 0) {
            JobsApi.fetchAllEdInvoices().then((data) => {
                const Rows = data.filter(row => row.status === "Pending")
                setInvoices(Rows);
                setLoading(false);
            })
        }
    });

    const approveInvoices = async () => {
        if (!invoicesSelected) {
            return
        }
        // check client by name in xero with server
        await fetch("https://scaff-m8-server.herokuapp.com/api/checkcontact", {
            method: 'POST',
            body: JSON.stringify({
                client: invoicesSelected[0]?.jobs?.clients?.client_name,
                branding: invoicesSelected[0]?.jobs?.branding
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(response => console.log('Success:', response));

        // send items to xero to create new invoce
        fetch("https://scaff-m8-server.herokuapp.com/invoice", {
            method: 'POST', // or 'PUT'
            body: JSON.stringify({
                type: "edinvoices",
                data: invoicesSelected
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
            .catch(error => addNotification({
                isSuccess: false,
                heading: "Error!",
                content: `Network Error With Xero.`,
            }))
            .then(response => {
                let isSuccess = true;
                let content = "Success!";
                if (response.err) {
                    isSuccess = false;
                    content = "Error!";
                }
                const heading = response.message;
                addNotification({
                    isSuccess,
                    heading,
                    content
                });
            })
        setInvoicesSelected([])
    };

    const headerTemplate = (data) => (
        <td className="" colSpan="6">
            <span className="text-gray-900 font-bold">{`${data?.jobs?.job_num} - ${data?.jobs?.site}`}</span>
        </td>
    );

    if (loading) {
        return (
            <div className="w-full h-48 flex justify-center items-center">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div>
            <Container>
                <PageHeading title="ED Invoices" isEditable={false} />

                <div className="mx-auto mt-8">
                    <Button label="Success" icon="submit" onClick={() => approveInvoices()} className="p-button-success">
                        Approve ED Invoices
                    </Button>

                    <br />

                    <EndOfMonth invoicesSelected={invoicesSelected} setInvoicesSelected={setInvoicesSelected} />

                    <br />

                    <XeroStatus />

                    <DataTable
                        ref={dt}
                        value={invoices}
                        dataKey="id"
                        selectionMode="checkbox"
                        groupRowsBy="job_id"
                        rowGroupMode="subheader"
                        // responsiveLayout="scroll"
                        // scrollHeight="600px"
                        emptyMessage="No weekly hire invoices found."
                        paginator
                        paginatorPosition="top|bottom|both"
                        showGridlines
                        rows={50}
                        rowsPerPageOptions={[25, 50, 100]}
                        rowGroupHeaderTemplate={headerTemplate}
                        selection={invoicesSelected}
                        onSelectionChange={e => setInvoicesSelected(e.value)}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
                        <Column
                            header="Zone"
                            headerStyle={{ textAlign: "center" }}
                            field="zone"
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Zone Label"
                            headerStyle={{ textAlign: "center" }}
                            field="zone_label"
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Type"
                            headerStyle={{ textAlign: "center" }}
                            field="type"
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Description"
                            headerStyle={{ textAlign: "center" }}
                            field="description"
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Erect cost"
                            headerStyle={{ textAlign: "center" }}
                            field="erect"
                            body={(row) => `$${row.erect.toFixed(2)}`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Erect %"
                            headerStyle={{ textAlign: "center" }}
                            field="erect_percent"
                            body={(row) => `${row.erect_percent}%`}
                            bodyStyle={{ textAlign: "center" }}

                        />
                        <Column
                            header="Dismantle cost"
                            headerStyle={{ textAlign: "center" }}
                            field="dismantle"
                            body={(row) => `$${row.dismantle.toFixed(2)}`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Dismantle %"
                            headerStyle={{ textAlign: "center" }}
                            field="dismantle_percent"
                            body={(row) => `${row.dismantle_percent}%`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="ED Total"
                            headerStyle={{ textAlign: "center" }}
                            field="ed_total"
                            body={(row) => `$${row.ed_total.toFixed(2)}`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Invoice"
                            headerStyle={{ textAlign: "center" }}
                            field="invoiced"
                            body={(row) => `$${row.invoiced.toFixed(2)}`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Balance"
                            headerStyle={{ textAlign: "center" }}
                            field="balance"
                            body={(row) => `$${row.balance.toFixed(2)}`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="% Complete"
                            headerStyle={{ textAlign: "center" }}
                            field="complete_percent"
                            body={(row) => `${row.complete_percent}%`}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="PO Number"
                            headerStyle={{ textAlign: "center" }}
                            field="PO_Number"
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Quote"
                            headerStyle={{ textAlign: "center" }}
                            field="Quote_Number"
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Duplicate"
                            headerStyle={{ textAlign: "center" }}
                            body={(row) => (
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
                                                delete row.id
                                                row.last_invoice = row.invoiced
                                                try {
                                                    await createEdInvoiceMutation.mutateAsync(row);
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
                            )}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Edit"
                            headerStyle={{ textAlign: "center" }}
                            body={(row) => (
                                <button type="button" onClick={() => {
                                    setEdinvoiceIDToEdit(row.id)
                                    setJob_idToEdit(row.job_id)
                                    setOpenToEdit(true)
                                }}>
                                    <PencilAltIcon className="h-4 w-4 text-gray-600" />
                                </button>
                            )}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Delete"
                            headerStyle={{ textAlign: "center" }}
                            body={(row) => (
                                <button type="button" onClick={() => {
                                    deleteEdInvoiceMutation.mutateAsync(row.id)
                                }}>
                                    <XIcon className="h-4 w-4 text-gray-600" />
                                </button>
                            )}
                            bodyStyle={{ textAlign: "center" }}
                        />
                        <Column
                            header="Last Time Updated"
                            headerStyle={{ textAlign: "center" }}
                            field="last_time_updated"
                            body={(row) => (
                                moment(row.last_time_updated).format("MMMM Do YYYY")
                            )}
                            bodyStyle={{ textAlign: "center" }}
                        />
                    </DataTable>
                </div>
            </Container>
            {
                openToEdit ?
                    < CreateEditEdInvoice job_id={job_idToEdit} edinvoiceID={edinvoiceIDToEdit} open={openToEdit} setOpen={setOpenToEdit} />
                    : <br />
            }
        </div >
    )
}