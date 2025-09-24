/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import moment from "moment";
import { SideModal, Input, TextArea, Dropdown, Spinner } from "../../common";
import { JobsApi } from "../../api";

const typeOptions = [
  { value: "Scaffolding", label: "Scaffolding" },
  { value: "Stairs", label: "Stairs" },
  { value: "Roof", label: "Roof" },
  { value: "Propping", label: "Propping" },
  { value: "Edge Protection", label: "Edge Protection" },
  { value: "Shrinkwrap", label: "Shrinkwrap" },
  { value: "Geda 1200", label: "Geda 1200" },
];

const statusOptions = [
  { value: "Approved", label: "Approved" },
  { value: "Pending", label: "Pending" }
];

export function CreateEditEdInvoice({ job_id, edinvoiceID, open, setOpen }) {
  const createEDinvoiceMutation = JobsApi.useCreateEdInvoice();
  const UpdateEDinvoiceMutation = JobsApi.useUpdateEdInvoice();

  const [edinvoiceData, setEdinvoiceData] = useState([])

  useEffect(() => {
    if (edinvoiceID) {
      JobsApi.fetchEdInvoice(edinvoiceID).then((data) => setEdinvoiceData(data[0]))
    }
  })

  if (edinvoiceID && edinvoiceData.length === 0) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <Formik
        initialValues={{
          id: edinvoiceID,
          zone: edinvoiceData.zone || "",
          zone_label: edinvoiceData.zone_label || "",
          type: edinvoiceData.type || "",
          description: edinvoiceData.description || "",
          percentage_complete: edinvoiceData.percentage_complete || 0,
          erect_percent: edinvoiceData.erect_percent || 0,
          dismantle_percent: edinvoiceData.dismantle_percent || 0,
          ed_total: edinvoiceData.ed_total || 0,
          complete_percent: edinvoiceData.complete_percent || 0,
          invoiced_percent: edinvoiceData.invoiced_percent || 0,
          invoiced: edinvoiceData.invoiced || 0,
          balance: edinvoiceData.balance || 0,
          last_invoice: edinvoiceData.last_invoice || 0,
          status: edinvoiceData.status || "Pending"
        }}
        onSubmit={async (values, { resetForm }) => {
          const { id, zone, zone_label, type,
            description, erect_percent, dismantle_percent, ed_total, balance, last_invoice,status } = values;

          let EdInvoicePayload = {};

          const last_time_updated = moment().toISOString();
          const complete_percent = Number(((Number(erect_percent) * 0.7) + (Number(dismantle_percent) * 0.3)).toFixed(2));
          const invoiced = Number((Number(ed_total) * (complete_percent / 100)).toFixed(2));

          if (edinvoiceID) {
            EdInvoicePayload = {
              id, zone, zone_label, type, description,
              last_time_updated,
              erect_percent: Number(erect_percent),
              dismantle_percent: Number(dismantle_percent),
              complete_percent,
              erect: Number((ed_total * 0.7).toFixed(2)),
              dismantle: Number((ed_total * 0.3).toFixed(2)),
              invoiced,
              balance: invoiced - last_invoice,
              ed_total: Number(ed_total),
              status
            };
          }
          else {
            EdInvoicePayload = {
              job_id: job_id ? Number(job_id) : null,
              last_time_updated,
              zone, zone_label, type, description,
              erect_percent: Number(erect_percent),
              dismantle_percent: Number(dismantle_percent),
              complete_percent,
              erect: Number((ed_total * 0.7).toFixed(2)),
              dismantle: Number((ed_total * 0.3).toFixed(2)),
              invoiced,
              balance: invoiced - last_invoice,
              ed_total: Number(ed_total)
            };
          }

          try {
            let result;
            if (edinvoiceID) {
              result = await UpdateEDinvoiceMutation.mutateAsync(EdInvoicePayload);
            }
            else {
              result = await createEDinvoiceMutation.mutateAsync(EdInvoicePayload);
            }

            setEdinvoiceData([]);
            resetForm();
            setOpen(false);

          } catch (err) {
            console.log("ERROR CREATING/UPDATING Invoice", err);
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
            heading={`${!edinvoiceID ? "Create new" : "Edit"}`}
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            isLoading={isSubmitting}
            formType={`${!edinvoiceID ? "create" : "update"}`}
          >
            <div className="flex items-center">
              <Input
                title="Zone"
                id="zone"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.zone}
              />
              <Input
                title="Zone Label"
                id="zone_label"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.zone_label}
              />
            </div>
            <div>
              <Dropdown
                label="Type"
                id="type"
                options={typeOptions}
                value={values.type}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>

            <div className="">
              <TextArea
                title="Description"
                id="description"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.description}
              />
            </div>

            <div className="flex items-center">

              <Input
                title="% completion erect"
                id="erect_percent"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.erect_percent}
              />

              <Input
                title="% completion dismantle"
                id="dismantle_percent"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.dismantle_percent}
              />
            </div>

            <div className="flex items-center">
              <Input
                title="ED Total"
                id="ed_total"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.ed_total}
              />

            </div>
            {edinvoiceID ?
            <div>
              <Dropdown
                label="Status"
                id="status"
                options={statusOptions}
                value={values.status}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>
            :""}

          </SideModal>
        )}
      </Formik>
    </div>
  );
}