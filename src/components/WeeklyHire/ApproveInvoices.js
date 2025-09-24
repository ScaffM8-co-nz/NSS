import { useState } from "react";
import moment from "moment";
import { DateSelect, Button, ConfirmationDialog } from "../../common";
import { useNotificationStore } from "../../store/notifications";

export const ApproveInvoices = ({ invoicesSelected, setInvoicesSelected }) => {
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(false);
    const [completed, setCompleted] = useState(false)
    const [date, setDate] = useState(moment().format("DD/MM/YYYY"));

    const approveInvoicesProcess = async () => {
        if (!invoicesSelected) {
            return
        }

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
                type: "weekly_hire_invoices",
                data: invoicesSelected,
                date
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
        setCompleted(true);
        setInvoicesSelected([]);
    };

    const handleInputChange = (id, val) => {
        setDate(moment(val).format("DD/MM/YYYY"))
    }

    return (
        <ConfirmationDialog
            isDone={completed}
            icon="info"
            title="Approve Weekly Hire Invoices"
            body="This action will send to xero the weekly hire invoices selected. Select A Date for the process"
            triggerButton={
                <Button label="Approve Weekly Hire Invoices"
                    style={{ backgroundColor: "#0078d4", borderRadius: "4px" }}
                    icon="submit"
                    className="p-button-raised p-3 flex align-items-center justify-content-center"
                >
                    Approve Weekly Hire Invoices
                </Button>
            }
            confirmButton={
                <Button
                    isLoading={isLoading}
                    variant="approve"
                    onClick={async (e) => {
                        setIsLoading(true);
                        approveInvoicesProcess();
                        setIsLoading(false);
                    }}
                >
                    Approve Weekly Hire Invoices
                </Button >
            }
        >
            <div className="flex">

                <DateSelect
                    title="Approve Weekly Hire Invoices"
                    id="date"
                    value={date}
                    onChange={handleInputChange}
                />

                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
            </div>
        </ConfirmationDialog >
    );
};