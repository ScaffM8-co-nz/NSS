import { useState } from "react";
import moment from "moment";
import { DateSelect, Button, ConfirmationDialog } from "../../common";
import { JobsApi } from "../../api";
import { useNotificationStore } from "../../store/notifications";


export const EndOfMonth = ({ invoicesSelected, setInvoicesSelected }) => {
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(moment().format("DD/MM/YYYY"));
    const [isDone, setIsDone] = useState(false);

    const endOfMouth = async () => {
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
                type: "edinvoices",
                endMouth: true,
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
                setIsLoading(false);
                setInvoicesSelected([]);
                setIsDone(true);
            })
    };

    const handleInputChange = (id, val) => {
        setDate(moment(val).format("DD/MM/YYYY"))
    }

    return (
        <ConfirmationDialog
            isDone={isDone}
            icon="info"
            title="End Of Month"
            body="This action will create a new ED Invoices And Aproved selected."
            triggerButton={
                <Button label="End Of The Month"
                    // style={{ backgroundColor: "#0078d4", borderRadius:"4px" }}
                    icon="submit"
                    className="p-button-raised p-3 flex align-items-center justify-content-center"
                >
                    End Of The Month
                </Button>
            }
            confirmButton={
                <Button
                    isLoading={isLoading}
                    variant="approve"
                    onClick={async (e) => {
                        setIsLoading(true);
                        endOfMouth();
                    }}
                >
                    End Of The Month
                </Button >
            }
        >
            {/*

            <div className="flex">

                <DateSelect
                    title="Date End Of Mouth"
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
        */}
        </ConfirmationDialog >
    );
};