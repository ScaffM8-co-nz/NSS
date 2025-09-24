/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { DocumentIcon } from "@heroicons/react/outline";
import moment from "moment";
import { Formik } from "formik";
import { Input, Dropdown, Spinner, DateSelect, ConfirmationDialog, Button } from "../../../common";

import { JobsApi, StaffApi, ClientContacts, ContactsApi } from "../../../api";

import { useNotificationStore } from "../../../store/notifications";
import supabase from "../../../api/supabase";

const yesNoOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const yesNoNaOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "N/A", label: "N/A" },
];

const assignToOptions = [
  { value: "Supervisor", label: "Supervisor" },
  { value: "Leading Hand", label: "Leading Hand" },
];

const invoiceTypeOptions = [
  { value: "Payment Claim", label: "Payment Claim" },
  { value: "Invoice", label: "Invoice" },
];

let staffOptions = [];
let staffOptionsByName = [];

export function HandoverForm({ jobId, handover, client_id }) {
  const [handoverData, setHandoverData] = useState(null);
  const { addNotification } = useNotificationStore();
  const [fileUpload, setFileUpload] = useState({
    file: "",
    status: "",
    url: "",
  });

  useEffect(() => {
    console.log("start Form Handover Document");
    StaffApi.fetchAllStaff().then((data) => {
      staffOptions = data.map((row) => ({ value: row?.id, label: row?.staff_name }));
      staffOptionsByName = data.map((row) => ({ value: row?.staff_name, label: row?.staff_name }));
    });
    if (handover.length) {
      setHandoverData(handover?.[0]);
    }
  }, []);
  const user = supabase.auth.user();

  const createJobHandoverMutation = JobsApi.useCreateJobHandover();
  const updateJobHandoverMutation = JobsApi.useUpdateJobHandover();
  const updateJobStatusMutation = JobsApi.useUpdateJob();
  const createContactMutation = ContactsApi.useCreateContact();

  const handleFileChoosen = async (e) => {
    const file = e.target.files[0];

    const randomNum = Math.floor(Math.random() * 10000) + 1;
    const fileName = `${file.name}-${randomNum}`;
    const uploadFile = await supabase.storage
      .from("job-files")
      .upload(`worksafe/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });
    const key = uploadFile?.data?.Key;
    if (key) {
      try {
        const uploadedFile = await supabase.storage
          .from("job-files")
          .getPublicUrl(`worksafe/${fileName}`);

        if (uploadedFile?.publicURL) {
          setFileUpload({
            ...fileUpload,
            file: fileName,
            status: "Success",
            url: uploadedFile?.publicURL,
          });

          addNotification({
            isSuccess: true,
            heading: "Success!",
            content: `Successfully uploaded File`,
          });
        }
      } catch (err) {
        addNotification({
          isSuccess: true,
          heading: "Error!",
          content: `Error uploading file!`,
        });
      }
    }
  };

  if (!user)
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <ConfirmationDialog
      isDone={createJobHandoverMutation.isSuccess || updateJobHandoverMutation.isSuccess}
      size="4xl"
      icon="info"
      title="Job Handover Document"
      body=""
      triggerButton={
        <Button
          size="sm"
          variant="inverse"
          className="mt-4"
          startIcon={<DocumentIcon className="w-4 h-4" />}
        >
          Handover Document
        </Button>
      }
      confirmButton={
        <Button
          type="submit"
          form="handoverForm"
          isLoading={
            createJobHandoverMutation.isLoading
              ? createJobHandoverMutation.isLoading
              : updateJobHandoverMutation.isLoading
          }
          disable={updateJobHandoverMutation.isLoading}
        >
          {updateJobHandoverMutation.isLoading
            ? "Updating Document..."
            : createJobHandoverMutation.isLoading
            ? "Creating Document..."
            : handover.length
            ? "Update Document"
            : "Create Document"}
        </Button>
      }
    >
      <div>
        <Formik
          initialValues={{
            job_id: jobId,
            // Financials
            billing_address: handoverData?.billing_address || "No",
            credit_check: handoverData?.credit_check || "No",
            credit_check_who: handoverData?.credit_check_who || "",
            credit_check_when:
              handoverData?.credit_check_when !== "Invalid date" && handoverData?.credit_check_when
                ? moment(handoverData?.credit_check_when, "DD/MM/YYYY").format("DD/MM/YYYY")
                : "",
            invoiceType: handoverData?.invoiceType || "",
            work_safe: handoverData?.work_safe || "",
            worksafe_uploaded: handoverData?.worksafe_uploaded || user?.user_metadata?.name,
            worksafe_uploaded_when: handoverData?.worksafe_uploaded_when
              ? moment(handoverData?.worksafe_uploaded_when).format("DD/MM/YYYY")
              : moment().format("DD/MM/YYYY"),
            sssp_added: handoverData?.sssp_added || "",
            swms_added: handoverData?.swms_added || "",
            hs_officer: handoverData?.hs_officer || "Kirsty Hitchens",
            hs_officer_phone: handoverData?.hs_officer_phone || "0211293909",
            hs_officer_email: handoverData?.hs_officer_email || "kirsty@nss.co.nz",
            operation_assignee: handoverData?.operation_assignee || "",
            site_forman: handoverData?.site_forman || "",
            site_forman_email: handoverData?.site_forman_email || "",
            site_forman_phone: handoverData?.site_forman_phone || "",
            site_forman2: handoverData?.site_forman2 || "",
            site_forman_email2: handoverData?.site_forman_email2 || "",
            site_forman_phone2: handoverData?.site_forman_phone2 || "",
            gear_shortages: handoverData?.gear_shortages || "",
            allowed_quote: handoverData?.allowed_quote || "",
            engaged_engineer: handoverData?.engaged_engineer || "",
            staff_availability: handoverData?.staff_availability || "",
            booked_shrinkwrappers: handoverData?.booked_shrinkwrappers || "",
            staff: handoverData?.staff || "",
            hs_officer_client: handoverData?.hs_officer_client || "",
            hs_officer_client_number: handoverData?.hs_officer_client_number || "",
            hs_officer_client_email: handoverData?.hs_officer_client_email || "",
          }}
          onSubmit={async (values) => {
            const creditCheck = values.credit_check_when;
            const handoverPayload = {
              job_id: Number(jobId),
              // Financials
              billing_address: values.billing_address,
              credit_check: values.credit_check,
              credit_check_who: values.credit_check_who,
              credit_check_when: creditCheck ? moment(creditCheck).format("DD/MM/YYYY") : "",
              invoiceType: values.invoiceType,
              // HEALTH & SAFETY
              work_safe: values?.work_safe || fileUpload.url,
              worksafe_uploaded: fileUpload.url ? values.worksafe_uploaded : "",
              worksafe_uploaded_when: fileUpload.url ? values.worksafe_uploaded_when : "",
              sssp_added: values.sssp_added,
              swms_added: values.swms_added,
              hs_officer: values.hs_officer,
              hs_officer_phone: values.hs_officer_phone,
              hs_officer_email: values.hs_officer_email,
              hs_officer_client: values.hs_officer_client,
              hs_officer_client_number: values.hs_officer_client_number,
              hs_officer_client_email: values.hs_officer_client_email,

              // OPERATIONS
              operation_assignee: values.operation_assignee, // staffOptions.find(e => e.value === values.operation_assignee)?.label,
              site_forman: values.site_forman,
              site_forman_email: values.site_forman_email,
              site_forman_phone: values.site_forman_phone,
              site_forman2: values.site_forman2,
              site_forman_email2: values.site_forman_email2,
              site_forman_phone2: values.site_forman_phone2,
              gear_shortages: values.gear_shortages,
              allowed_quote: values.allowed_quote,
              engaged_engineer: values.engaged_engineer,
              staff_availability: values.staff_availability,
              booked_shrinkwrappers: values.booked_shrinkwrappers,
              staff: values.staff,
            };
            console.log(handoverData, "handoverData");
            if (!handoverData) {
              const resp = await createJobHandoverMutation.mutateAsync(handoverPayload);
              console.log(resp, "resp");
            } else {
              await updateJobHandoverMutation.mutateAsync({
                payload: handoverPayload,
                handoverId: handoverData.id,
              });
            }
            const jobPayload = {
              job: {
                job_status: "In Progress",
                on_hire: "Yes",
              },
              jobId,
            };
            await updateJobStatusMutation.mutateAsync(jobPayload);

            // check if contact exist

            const clientContacts = await ContactsApi.fetchAllContacts(client_id);
            const contactFound1 = clientContacts.find(
              (e) => e.email === handoverPayload.site_forman_email,
            );
            const contactFound2 = clientContacts.find(
              (e) => e.email === handoverPayload.site_forman_email2,
            );

            if (contactFound1 === undefined) {
              await createContactMutation.mutateAsync({
                name: handoverPayload.site_forman,
                email: handoverPayload.site_forman_email,
                phone: handoverPayload.site_forman_phone,
                client_id,
                status: "Active",
              });
            }

            if (contactFound2 === undefined) {
              await createContactMutation.mutateAsync({
                name: handoverPayload.site_forman2,
                email: handoverPayload.site_forman_email2,
                phone: handoverPayload.site_forman_phone2,
                client_id,
                status: "Active",
              });
            }
          }}
          validate={(values) => {
            const errors = {};
            console.log(values, "values");
            if (!values.billing_address) errors.billing_address = "billing_address Is Required.";
            if (!values.credit_check) errors.credit_check = "credit_check Is Required.";
            if (!values.invoiceType) errors.invoiceType = "invoiceType Is Required.";
            if (values.credit_check === "Yes" && !values.credit_check_who)
              errors.credit_check_who = "credit check who Is Required.";
            if (values.credit_check === "Yes" && !values.credit_check_when)
              errors.credit_check_when = "credit check When Is Required.";
            if (!values.worksafe_uploaded_when)
              errors.worksafe_uploaded_when = "worksafe_uploaded_when Is Required.";
            if (!values.sssp_added) errors.sssp_added = "sssp_added Is Required.";
            if (!values.swms_added) errors.swms_added = "swms_added Is Required.";
            if (!values.hs_officer) errors.hs_officer = "hs_officer Is Required.";
            if (!values.hs_officer_phone) errors.hs_officer_phone = "hs_officer_phone Is Required.";
            if (!values.hs_officer_email) errors.hs_officer_email = "hs_officer_email Is Required.";
            if (!values.operation_assignee)
              errors.operation_assignee = "operation_assignee Is Required.";
            if (!values.site_forman) errors.site_forman = "site_forman Is Required.";
            if (!values.site_forman_phone)
              errors.site_forman_phone = "site_forman_phone Is Required.";
            if (!values.site_forman_email)
              errors.site_forman_email = "site_forman_email Is Required.";
            if (!values.gear_shortages) errors.gear_shortages = "gear_shortages Is Required.";
            if (!values.allowed_quote) errors.allowed_quote = "allowed_quote Is Required.";
            if (!values.engaged_engineer) errors.engaged_engineer = "engaged_engineer Is Required.";
            if (!values.staff_availability)
              errors.staff_availability = "staff_availability Is Required.";
            if (!values.booked_shrinkwrappers)
              errors.booked_shrinkwrappers = "booked_shrinkwrappers Is Required.";
            if (!values.staff) errors.staff = "Supervisor Is Required.";
            if (!values.hs_officer_client)
              errors.hs_officer_client = "Client H&S Officer Is Required.";
            if (!values.hs_officer_client_number)
              errors.hs_officer_client_number = "Client H&S Officer Phone # Is Required.";
            if (!values.hs_officer_client_email)
              errors.hs_officer_client_email = "Client H&S Officer Email Is Required.";
            console.log(errors, "errror");
            return errors;
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
            <form onSubmit={handleSubmit} className="w-full" id="handoverForm">
              {/** ****************************************
               *
               * FINANCIALS
               *
               **************************************** */}
              <div>
                <h2 className="pl-4 text-md leading-6 uppercase text-gray-700 my-4">FINANCIALS</h2>
                <div className="border-b" />
                <div className="flex items-center">
                  <Dropdown
                    label="Billing Address Added?"
                    id="billing_address"
                    value={values.billing_address}
                    error={errors.billing_address}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                  <Dropdown
                    label="Credit Check Completed?"
                    id="credit_check"
                    value={values.credit_check}
                    error={errors.credit_check}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                </div>
                <Dropdown
                  label="Invoice Type"
                  id="invoiceType"
                  value={values.invoiceType}
                  error={errors.invoiceType}
                  onChange={setFieldValue}
                  onBlur={setFieldTouched}
                  options={invoiceTypeOptions}
                />
              </div>

              {values.credit_check === "Yes" && (
                <div className="flex items-center">
                  <Input
                    title="By Who?"
                    id="credit_check_who"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.credit_check_who}
                    error={errors.credit_check_who}
                  />
                  <DateSelect
                    title="When?"
                    id="credit_check_when"
                    value={values.credit_check_when}
                    error={errors.credit_check_when}
                    onChange={setFieldValue}
                  />
                </div>
              )}

              {/** ****************************************
               *
               * HEALTH & SAFETY
               *
               **************************************** */}
              <h2 className="pl-4 text-md leading-6 uppercase text-gray-700 my-4">
                Health & Safety
              </h2>
              <div className="border-b" />
              <h2 className="pl-4 text-sm leading-6 uppercase text-gray-700 my-4">
                Work Safe Notification PDF
              </h2>
              {handoverData?.work_safe ? (
                <a
                  target="_blank"
                  href={handoverData?.work_safe}
                  rel="noreferrer"
                  className="px-4 text-blue-500"
                >
                  Uploaded PDF Document
                </a>
              ) : (
                <div className="flex items-center pl-4">
                  <input type="file" onChange={handleFileChoosen} />
                  {fileUpload.url && (
                    <a
                      target="_blank"
                      href={fileUpload.url}
                      rel="noreferrer"
                      className="text-blue-500"
                    >
                      {fileUpload.file || "File"}
                    </a>
                  )}
                </div>
              )}

              {fileUpload.url && (
                <div className="flex items-center border-b">
                  <Input
                    title="Uploaded By"
                    id="worksafe_uploaded"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.worksafe_uploaded}
                    error={errors.worksafe_uploaded}
                  />
                  <DateSelect
                    title="Uploaded Date"
                    id="worksafe_uploaded_when"
                    value={values.worksafe_uploaded_when}
                    error={errors.worksafe_uploaded_when}
                    onChange={setFieldValue}
                  />
                </div>
              )}

              <div className="flex items-center">
                <Dropdown
                  label="SSSP Added?"
                  id="sssp_added"
                  value={values.sssp_added}
                  error={errors.sssp_added}
                  onChange={setFieldValue}
                  onBlur={setFieldTouched}
                  options={yesNoNaOptions}
                />
                <Dropdown
                  label="SWMS Added?"
                  id="swms_added"
                  value={values.swms_added}
                  error={errors.swms_added}
                  onChange={setFieldValue}
                  onBlur={setFieldTouched}
                  options={yesNoNaOptions}
                />
              </div>
              <div className="flex items-center">
                <Input
                  title="H&S Officer"
                  id="hs_officer"
                  type="text"
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  value={values.hs_officer}
                  error={errors.hs_officer}
                />
                <Input
                  title="H&S Officer Phone #"
                  id="hs_officer_phone"
                  type="text"
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  value={values.hs_officer_phone}
                  error={errors.hs_officer_phone}
                />
                <Input
                  title="H&S Officer Email"
                  id="hs_officer_email"
                  type="text"
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  value={values.hs_officer_email}
                  error={errors.hs_officer_email}
                />
              </div>

              {/** ****************************************
               *
               * OPERATIONS
               *
               **************************************** */}
              <div>
                <h2 className="pl-4 text-md leading-6 uppercase text-gray-700 my-4">Operations</h2>
                <div className="border-b" />
                <div className="flex items-center">
                  <Dropdown
                    label="Leading Hand"
                    id="operation_assignee"
                    value={values.operation_assignee}
                    error={errors.operation_assignee}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={staffOptionsByName}
                  />
                  <Dropdown
                    label="Supervisor"
                    id="staff"
                    value={values.staff}
                    error={errors.staff}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={staffOptions}
                  />
                </div>
                <div className="w-1/2">
                  <Input
                    title="Client Site Foreman"
                    id="site_forman"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.site_forman}
                    error={errors.site_forman}
                  />
                </div>
                <div className="flex items-center">
                  <Input
                    title="Client Site Foreman Phone"
                    id="site_forman_phone"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.site_forman_phone}
                    error={errors.site_forman_phone}
                  />
                  <Input
                    title="Client Site Foreman Email"
                    id="site_forman_email"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.site_forman_email}
                    error={errors.site_forman_email}
                  />
                </div>

                <div className="w-1/2">
                  <Input
                    title="Client Site Foreman 2"
                    id="site_forman2"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.site_forman2}
                    // error={errors.site_forman}
                  />
                </div>
                <div className="flex items-center">
                  <Input
                    title="Client Site Foreman Phone 2"
                    id="site_forman_phone2"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.site_forman_phone2}
                    // error={errors.site_forman_phone}
                  />
                  <Input
                    title="Client Site Foreman Email 2"
                    id="site_forman_email2"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.site_forman_email2}
                    // error={errors.site_forman_email2}
                  />
                </div>

                <div className="flex items-centers">
                  <Input
                    title="Client H&S Officer"
                    id="hs_officer_client"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.hs_officer_client}
                    error={errors.hs_officer_client}
                  />
                  <Input
                    title="Client H&S Officer Phone #"
                    id="hs_officer_client_number"
                    type="number"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.hs_officer_client_number}
                    error={errors.hs_officer_client_number}
                  />
                </div>
                <div className="w-1/2">
                  <Input
                    title="Client H&S Officer Email"
                    id="hs_officer_client_email"
                    type="text"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    value={values.hs_officer_client_email}
                    error={errors.hs_officer_client_email}
                  />
                </div>

                <div className="flex items-center">
                  <Dropdown
                    label="Have you notified management of potential gear shortages to complete this job?"
                    id="gear_shortages"
                    value={values.gear_shortages}
                    error={errors.gear_shortages}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                  <Dropdown
                    label="Are you familiar with what has been allowed for in the quote?"
                    id="allowed_quote"
                    value={values.allowed_quote}
                    error={errors.allowed_quote}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                </div>

                <div className="flex items-center">
                  <Dropdown
                    label="Have you engaged with an Engineer if required on the Job?"
                    id="engaged_engineer"
                    value={values.engaged_engineer}
                    error={errors.engaged_engineer}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                  <Dropdown
                    label="Have you confirmed staff availability?"
                    id="staff_availability"
                    value={values.staff_availability}
                    error={errors.staff_availability}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                </div>

                <div className="flex w-1/2">
                  <Dropdown
                    label="Have you booked in shinkwrappers if required?"
                    id="booked_shrinkwrappers"
                    value={values.booked_shrinkwrappers}
                    error={errors.booked_shrinkwrappers}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    options={yesNoOptions}
                  />
                </div>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </ConfirmationDialog>
  );
}
