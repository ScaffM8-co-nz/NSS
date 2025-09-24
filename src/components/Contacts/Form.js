import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Formik } from "formik";
import { SideModal, Input, Dropdown, Address, Spinner } from "../../common";
import { statusOptions } from "../../utils";

import { useClients } from "../../api/Clients";
import { ContactsApi } from "../../api";

export function ContactForm({ heading, open, setOpen, formType, setContactId, contactId }) {
  const [contact, setContact] = useState([]);
  const [payload, setPayload] = useState({});

  const clientData = useClients();

  const getContact = ContactsApi.fetchClient;
  const createContactMutation = ContactsApi.useCreateContact();
  const updateClientMutation = ContactsApi.useupdateContact();

  const history = useHistory();
  const { clientId } = useParams();

  useEffect(() => {
    if (!formType) {
      formType = "create"
    }

    let isCurrent = true;

    if (!open && clientId) {
      history.goBack();
    }

    if (contactId) {
      getContact(contactId).then((contactData) => {
        setContact({
          clientId,
          id: contactData?.id || "",
          name: contactData?.name || "",
          email: contactData?.email || "",
          phone: contactData?.phone || "",
          status: contactData?.status || "Active",
        })
      })
    }

    return () => {
      isCurrent = false;
    };
  }, [clientId, open]);

  const renderClientList = () => {
    if (clientData?.data && clientData?.data?.length > 0) {
      return clientData.data.map((client) => ({
        label: client.client_name,
        value: client.id,
      }));
    }
    return [];
  };
  
  if (formType === "edit" && !contact?.id) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <div>
      <Formik
        initialValues={{
          id: contact?.id,
          client_id: contact?.clientId || "",
          name: contact?.name,
          email: contact?.email || "",
          phone: contact?.phone || "",
          status: contact?.status || "Active",
        }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSubmitting(true);
          const contactPayload = {
            client_id: Number(values.client_id),
            name: values.name,
            email: values.email,
            phone: values.phone,
            status: values.status,
          };

          try {
            if (formType === "edit") {
              contactPayload.client_id = contact.clientId
              const result = await updateClientMutation.mutateAsync({
                contact: contactPayload,
                contactId: contact.id,
              });
              setContactId(result?.[0]?.id);
            } else {
              const result = await createContactMutation.mutateAsync(contactPayload);
              setContactId(result?.[0]?.id);
            }

            setOpen(false);
            resetForm();
          } catch (err) {
            console.log("ERROR UPDATING", err);
          }
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
            <div className="flex">
              <Input
                title="Contact Name"
                id="name"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.name}
              />

              <Dropdown
                label="Client"
                id="client_id"
                value={values.client_id}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
                isLoading={clientData.isLoading}
                options={renderClientList()}
              />
            </div>
            <div className="flex items-center">
              <Input
                title="Email"
                id="email"
                type="email"
                icon="email"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.email}
              />
              <Input
                title="Contact #"
                id="phone"
                type="text"
                icon="phone"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.phone}
              />
            </div>
            <div className="w-1/2">
              <Dropdown
                label="Status"
                id="status"
                options={statusOptions}
                value={values.status}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>
          </SideModal>
        )}
      </Formik>
    </div>
  );
}
