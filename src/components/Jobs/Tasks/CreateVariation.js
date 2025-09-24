/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { SideModal, Input, TextArea, Dropdown, Address, DateSelect } from "../../../common";

import { JobsApi, ContactsApi } from "../../../api";
import supabase from "../../../api/supabase";

const typeOptions = [
  { value: "Scaffolding", label: "Scaffolding" },
  { value: "Stairs", label: "Stairs" },
  { value: "Roof", label: "Roof" },
  { value: "Propping", label: "Propping" },
  { value: "Edge Protection", label: "Edge Protection" },
  { value: "Shrinkwrap", label: "Shrinkwrap" },
  { value: "Geda 1200", label: "Geda 1200" },
];

let RequesterOptions = [{ value: "Loading", label: "Loading" }];

export function CreateVariation({ jobId, open, setOpen }) {
  const createTaskMutation = JobsApi.useCreateVariation();

  JobsApi.fetchJob(jobId).then(data => {
    ContactsApi.fetchAllContacts(data.client_id).then(contacts => {
      RequesterOptions = contacts.map(e => ({ value: e.name, label: e.name }));
    })
  })

  return (
    <div>
      <Formik
        initialValues={{
          PO_Number: "",
          zone: "",
          zone_label: "",
          type: "",
          description: "",
          percentage_erect: 0,
          percentage_dismantle: 0,
          total_hours: "",
          Requester: "",
        }}
        onSubmit={async (values, { resetForm }) => {
          const loggedInuser = await supabase.auth.user();
          const name = loggedInuser?.user_metadata?.name;

          const hours = Number(values.total_hours);
          const fixed = hours.toFixed(2);
          const taskPayload = {
            job_id: Number(jobId),
            PO_Number: values.PO_Number || "",
            task_type: "Variation",
            zone: values.zone,
            zone_label: values.zone_label,
            type: values.type,
            description: values.description,
            percentage_erect: Number(values.percentage_erect) || 0,
            percentage_dismantle: Number(values.percentage_dismantle) || 0,
            percentage_complete: ((Number(values.percentage_erect) * 0.7) + (Number(values.percentage_dismantle) * 0.3)) || 0,
            total_hours: String(fixed),
            Requester: values.Requester || "",
            created_by: name || "",
          };

          try {
            await createTaskMutation.mutateAsync(taskPayload);

            setOpen(false);
            resetForm();
          } catch (err) {
            console.log("ERROR CREATING JOB", err);
          }
        }}
        validate={(values) => {
          const errors = {};

          if (!values.PO_Number) errors.PO_Number = "PO Number Is Required.";
          if (!values.Requester) errors.Requester = "Requester Is Required.";
          if (!values.zone) errors.zone = "Zone Is Required.";
          if (!values.zone_label) errors.zone_label = "Zone Label Is Required.";
          if (!values.type) errors.type = "Type Is Required.";
          if (!values.description) errors.description = "Description Is Required.";
          if (!values.total_hours) errors.total_hours = "Total Hours Is Required.";
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
          <SideModal
            heading="Create Variation Task"
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            isLoading={isSubmitting}
            formType="create"
          >
            <div className="flex items-center">
              <Input
                title="PO Number"
                id="PO_Number"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.PO_Number}
                value={values.PO_Number}
              />
              <Dropdown
                label="Requester"
                id="Requester"
                options={RequesterOptions}
                error={errors.Requester}
                value={values.Requester}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>
            <div className="flex items-center">
              <Input
                title="Zone"
                id="zone"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.zone}
                value={values.zone}
              />
              <Input
                title="Zone Label"
                id="zone_label"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.zone_label}
                value={values.zone_label}
              />
            </div>
            <div className="w-1/2">
              <Dropdown
                label="Type"
                id="type"
                options={typeOptions}
                error={errors.type}
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
                error={errors.description}
                value={values.description}
              />
            </div>

            <div className="flex items-center">
              <Input
                title="Percentage Complete"
                id="percentage_erect"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                // error={errors.percentage_erect}
                value={values.percentage_erect}
              />
              <Input
                title="Percentage Dismantle"
                id="percentage_dismantle"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                // error={errors.percentage_dismantle}
                value={values.percentage_dismantle}
              />
            </div>
            <div className="w-1/2">
              <Input
                title="Total Hours"
                id="total_hours"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.total_hours}
                value={values.total_hours}
              />
            </div>
          </SideModal>
        )}
      </Formik>
    </div>
  );
}