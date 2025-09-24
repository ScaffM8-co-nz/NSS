import React, { useEffect, useState } from "react";
import { JobsApi } from "../../api";
import { Button, Dropdown, ConfirmationDialog } from "../../common";

const monthOptions = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" }
]

export const ExportTaskByJob = ({ jobId }) => {

    const [month, setMonth] = useState(null);

    const tasksQuery = JobsApi.useGetAllTasks(jobId);

    const exportReport = () => {
        if (!month) {
            return
        }

        const result = [];

        for (const taskRow of tasksQuery.data) {
            const foundMonth = taskRow.history.filter(row => row.Month === month)
            if (foundMonth.length > 0) {
                result.push(taskRow)
            }
        }

        console.log(result)
        console.log(".........")

        const csvFileData = result.map(row => [
            row.zone,
            row.zone_label,
            row.type,
            row.description,
            row.total_hours,
            row.complete,
            row.created_by,
            row.percentage_complete
        ])

        download_csv_file(csvFileData)

    }

    return (
        <div className="w-full">
            <ConfirmationDialog
                // isDone={createEdInvoiceMutation.isSuccess}
                icon="info"
                title="Export"
                // body="This action will create a new ED Invoices And Aproved selected."
                triggerButton={
                    <div className="grid justify-items-end">
                        <Button label="Export"
                            // style={{ backgroundColor: "#0078d4", borderRadius:"4px" }}
                            icon="submit"
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Export
                        </Button></div>
                }
                confirmButton={
                    <Button
                        // isLoading={isLoading}
                        variant="approve"
                        onClick={async (e) => {
                            exportReport()
                        }}
                    >
                        Export
                    </Button >
                }
            >
                <Dropdown
                    label="Select Month To Export"
                    id="month"
                    value={month}
                    onChange={(id, value) => setMonth(value)}
                    onBlur={() => console.log("blur")}
                    options={monthOptions}
                />
                <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            </ConfirmationDialog >
        </div>
    )
}

const download_csv_file = (data) => {

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "zone,zone_label,type,description,total_hours,complete,created_by,percentage_complete\r\n"

    data.forEach((rowArray) => {
        const row = rowArray.join(",");
        csvContent += `${row}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);

}  