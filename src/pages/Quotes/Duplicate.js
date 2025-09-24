/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useStateWithCallbackLazy } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Formik } from "formik";
import { SideModal, Input, TextArea, Dropdown, Address, DateSelect } from "../../common";
import { QuotesApi, ClientsApi, ContactsApi } from "../../api";
import { fetchAllContacts } from "../../api/ClientContacts";

function CloneQuoteForm({ heading, open, setOpen, formType = "create" }) {
    const history = useHistory();
    const { quoteId } = useParams();

    const [listClients, setListClients] = useState([]);
    const [clientId, setClientId] = useState(null);
    const [listContacts, setListContacts] = useState([])
    const cloneMutation = QuotesApi.useClone();

    const clientsQuery = ClientsApi.useClients();
    const quoteQuery = QuotesApi.useFetchQuote(quoteId);

    useEffect(() => {
        let isCurrent = true;

        if (!open && quoteId) {
            history.goBack();
        }

        return () => {
            isCurrent = false;
        };
    }, [quoteId, open]);

    const loadContacts = async (ID) => {
            const contactsRes = await fetchAllContacts(ID);
            let contacts;
            if (contactsRes && contactsRes.length > 0) {
                contacts = contactsRes.map((contact) => ({
                    label: contact.name,
                    value: contact.id
                }));
            } else {
                contacts = [];
            }
            setListContacts(contacts);
        
    };

    if (clientsQuery.data && listClients.length === 0) {
        const newList = clientsQuery.data.map((row) => {
            const { id, client_name } = row
            return { value: id, label: client_name }
        })
        setListClients(newList)
    }

    if (quoteQuery.isLoading || listClients.length === 0) {
        return (<div>Loading</div>)
    }

    return (
        <div>
            <Formik
                initialValues={{
                    client: 0,
                    contact_id: 0,
                    address1: "",
                    address2: "",
                    city: "",
                    postal: ""
                }}
                enableReinitialize
                validate={(values) => {
                    const errors = {};
                    if (!values.client) {
                        errors.client = "Client is required.";
                    }
                    return errors;
                }}
                onSubmit={async (values, { setSubmitting, resetForm }) => {

                    const data = await QuotesApi.fetchQuote(quoteId);
                    data.client = values.client;
                    data.contact_id = values.contact_id;
                    data.street_1 = values.address1;
                    data.street_2 = values.address2;
                    data.city = values.city;
                    data.post_code = values.postal;

                    try {
                        console.time("clone quote");
                        await cloneMutation.mutateAsync(data);
                        console.timeEnd("clone quote");
                    } catch (err) {
                        console.log("ERR", err);
                    }

                    setOpen(false);
                    resetForm();
                }}

            >
                {({
                    values,
                    errors,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    setFieldValue,
                    setFieldTouched,
                }) => (
                    <SideModal
                        heading={heading}
                        open={open}
                        setOpen={setOpen}
                        handleSubmit={handleSubmit}
                        isLoading={isSubmitting}
                        formType={formType}
                    >
                        <div className="flex items-center">
                            <Dropdown
                                label="Client"
                                id="client"
                                value={values.client}
                                onBlur={setFieldTouched}
                                options={listClients}
                                onChange={(opt, value) => {
                                    setFieldValue("client", value);
                                    setClientId(value);
                                    loadContacts(value);
                                }}
                                error={errors.client}
                            />
                            <Dropdown
                                label="Contact"
                                id="contact_id"
                                value={values.contact_id}
                                onBlur={setFieldTouched}
                                options={listContacts}
                                onChange={setFieldValue}
                            />
                        </div>
                        <div className="flex items-center">
                            <Input
                                title="street 2"
                                id="address2"
                                type="text"
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                value={values.address2}
                            />
                            <Input
                                title="site address"
                                id="address1"
                                type="text"
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                value={values.address1}
                            />
                        </div>
                        <div className="flex items-center">
                            <Input
                                title="City"
                                id="city"
                                type="text"
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                value={values.city}
                            />
                            <Input
                                title="Postal Code"
                                id="postal"
                                type="number"
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                value={values.postal}
                            />
                        </div>
                    </SideModal>
                )}
            </Formik>
        </div >
    );
}

export const CloneQuote = (props) => {
    const [open, setOpen] = useState(true);
    return (
        <>
            <CloneQuoteForm open={open} setOpen={setOpen} formType="edit" />
        </>
    );
};