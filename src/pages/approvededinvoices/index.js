import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import moment from "moment";
import { PageHeading, Spinner } from "../../common";
import { Container } from "../../utils";
import { JobsApi } from "../../api";

export const EdInvoicesApprovedMain = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const dt = React.useRef(null);
    useEffect(() => {
        if (loading && invoices.length === 0) {
            JobsApi.fetchAllEdInvoices().then((data) => {
                const Rows = data.filter(row => row.status === "Approved")
                setInvoices(Rows);
                setLoading(false);
            })
        }
    });


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
                <PageHeading title="Approved ED Invoices" isEditable={false} />

                <div className="mx-auto mt-8">
                    <DataTable
                        ref={dt}
                        value={invoices}
                        dataKey="id"
                        selectionMode="checkbox"
                        groupRowsBy="job_id"
                        rowGroupMode="subheader"
                        // responsiveLayout="scroll"
                        // scrollHeight="600px"
                        emptyMessage="No ED invoices Approved found."
                        paginator
                        paginatorPosition="top|bottom|both"
                        showGridlines
                        rows={50}
                        rowsPerPageOptions={[25, 50, 100]}
                        rowGroupHeaderTemplate={headerTemplate}
                    >
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
                            header="Invoice Number"
                            headerStyle={{ textAlign: "center" }}
                            field="xeroReference"
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
        </div >
    )
}