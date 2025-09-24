import React, { useEffect, useState } from "react";
import { PencilAltIcon } from "@heroicons/react/outline";
import { Table, Button } from "../../common";
import { ContactForm } from "./Form";
import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { fetchAllContacts } from "../../api/ClientContacts";


export function TableContacts({ clientId }) {
    const [contacts, setContacts] = useState([]);
    // Contact Form
    const [contactForm, setContactForm] = useState(false);
    const [contactId, setContactId] = useState(null);


    useEffect(() => {
        fetchAllContacts(clientId).then((data) => setContacts(data));
    }, [clientId]);

    return (
        <div>
            <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">Contacts details</h2>

            <div className="px-8 py-2">
                <Button
                    type="button"
                    onClick={() => {
                        setContactId(null)
                        setContactForm(true)
                    }}>
                    Add New Contact
                </Button>
            </div>
      
            <Table
                cols={[
                    {
                        Header: "Names",
                        accessor: "name"
                    },
                    {
                        Header: "Email",
                        accessor: "email"
                    },
                    {
                        Header: "Phone",
                        accessor: "phone"
                    },
                    {
                        Header: "Status",
                        accessor: "status"
                    },
                    {
                        Header: "Edit",
                        accessor: "id",
                        Cell: ({ row }) => (
                            <button
                                type="button"
                                onClick={() => {
                                    setContactId(row.values.id)
                                    setContactForm(true)
                                }}

                            >
                                <PencilAltIcon className="text-gray-600 h-4 w-4" />
                            </button>
                        ),
                        width: 60,
                    }
                ]}

                tableData={contacts}
            />
            {contactForm && !contactId ?


                <div>
                    <ContactForm
                        heading="Create Contact"
                        open={contactForm}
                        setOpen={setContactForm}
                        setContactId={setContactId}
                        contactId={contactId}
                    />
                </div>
                : <br />
            }

            {contactForm && contactId ?


                <div>
                    <ContactForm
                        heading="Create Contact"
                        open={contactForm}
                        setOpen={setContactForm}
                        setContactId={setContactId}
                        contactId={contactId}
                        formType="edit"
                    />
                </div>
                : <br />
            }
        </div>
    )
}