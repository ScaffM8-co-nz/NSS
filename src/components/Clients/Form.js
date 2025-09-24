import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Formik } from "formik";
import { SideModal, Input, Dropdown, Address, Spinner } from "../../common";
import { statusOptions } from "../../utils";
import { fetchClient, useCreateClient, useUpdateClient } from "../../api/Clients";
import { fetchAllContacts } from "../../api/ClientContacts";

export function ClientForm({ heading, open, setOpen, formType = "create", setClientId }) {
  const [client, setClient] = useState([]);
  const [mainContactOptions, setMainContactOptions] = useState([]);
  const [payload, setPayload] = useState({});

  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  const history = useHistory();
  const { clientId } = useParams();

  useEffect(() => {
    let isCurrent = true;

    if (!open && clientId) {
      history.goBack();
    }

    if (clientId) {
      fetchClient(clientId).then((clientData) => {
        if (isCurrent) setClient(clientData);
      });
      fetchAllContacts(clientId).then((contactsData) => {
        if (isCurrent) {
          const contacts = contactsData.map((e) => ({ value: e.id, label: e.name }));
          setMainContactOptions(contacts);
        }
      });
    }

    return () => {
      isCurrent = false;
    };
  }, [clientId, open]);

  if (formType === "edit" && !client.id)
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  return (
    <div>
      <Formik
        initialValues={{
          client_name: client?.client_name || "",
          email: client?.email || "",
          phone: client?.phone || "",
          status: client?.status || "Active",
          main_contact: client?.main_contact?.id || null,
          billing_address: client?.billing_address || "",
        }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSubmitting(true);
          const { client_name, email, phone, status, main_contact, billing_address } = values;
          const clientPayload = {
            client_name,
            email,
            phone,
            status,
            main_contact,
            billing_address
          };

          try {
            if (formType === "edit") {
              const result = await updateClientMutation.mutateAsync({
                client: clientPayload,
                clientId: client?.id,
              });
            } else {
              const result = await createClientMutation.mutateAsync(clientPayload);

              setClientId(result?.[0]?.id);
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
                title="Company"
                id="client_name"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.client_name}
              />
              <Input
                title="Billing Address"
                id="billing_address"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.billing_address}
              />
            </div>
            <div className="flex items-center">
              <Input
                title="Contact #"
                id="phone"
                type="text"
                icon="phone"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.phone}
              />
              <Input
                title="Email"
                id="email"
                type="email"
                icon="email"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.email}
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
            <div className="w-1/2">
              <Dropdown
                label="Main Contact"
                id="main_contact"
                options={mainContactOptions}
                value={values.main_contact}
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
