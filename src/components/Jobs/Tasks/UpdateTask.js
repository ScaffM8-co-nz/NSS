/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SideModal, Input, TextArea } from "../../../common";

import { JobsApi, ContactsApi } from "../../../api";

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

export function UpdateTask({ taskId, jobId, open, setOpen, type = "tasks" }) {
  const updateTaskMutation = JobsApi.useUpdateTask();

  JobsApi.fetchJob(jobId).then(data => {
    ContactsApi.fetchAllContacts(data.client_id).then(contacts => {
      RequesterOptions = contacts.map(e => ({ value: e.name, label: e.name }));
    })
  })

  const tasksQuery = JobsApi.useFetchTask(taskId);

  if (tasksQuery.isLoading) {
    return (
      <div />
    );
  }

  if (!tasksQuery.data) return null;

  return (
    <div>
      <Formik
        initialValues={{
          PO_Number: tasksQuery.data.PO_Number || "",
          zone: tasksQuery.data.zone || "",
          zone_label: tasksQuery.data.zone_label || "",
          type: tasksQuery.data.type || "",
          description: tasksQuery.data.description || "",
          percentage_complete: tasksQuery.data.percentage_complete || 0,
          percentage_erect: tasksQuery.data.percentage_erect || 0,
          percentage_dismantle: tasksQuery.data.percentage_dismantle || 0,
          total_hours: tasksQuery.data.total_hours || "",
          Requester: tasksQuery.data.Requester || ""
        }}
        onSubmit={async (values, { resetForm }) => {
          const hours = Number(values.total_hours);
          const fixed = hours.toFixed(2);
          const taskPayload = {
            job_id: Number(jobId),
            // PO_Number: values.PO_Number || "",
            zone: values.zone,
            zone_label: values.zone_label,
            // type: values.type,
            description: values.description,
            percentage_erect: Number(values.percentage_erect) || 0,
            percentage_dismantle: Number(values.percentage_dismantle) || 0,
            percentage_complete: ((Number(values.percentage_erect) * 0.7) + (Number(values.percentage_dismantle) * 0.3)) || 0,
            total_hours: String(fixed),
            // Requester: values.Requester || ""
          };

          try {
            await updateTaskMutation.mutateAsync({
              payload: taskPayload,
              taskId,
              type: "task",
            });
            resetForm();
            setOpen(false);
          } catch (err) {
            console.log("ERROR CREATING JOB", err);
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
            heading="Update Task"
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            isLoading={isSubmitting}
            formType="edit"
          >
            {/* <div className="flex items-center">
              <Input
                title="PO Number"
                id="PO_Number"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
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
            </div> */}
            <div className="flex items-center">
              <Input
                title="Zone"
                id="zone"
                type="text"
                // handleChange={handleChange}
                // handleBlur={handleBlur}
                value={values.zone}
              />
              <Input
                title="Zone Label"
                id="zone_label"
                type="text"
                // handleChange={handleChange}
                // handleBlur={handleBlur}
                value={values.zone_label}
              />
            </div>
            {/* <div className="w-1/2">
              <Dropdown
                label="Type"
                id="type"
                options={typeOptions}
                value={values.type}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div> */}

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
                title="Percentage Erect"
                id="percentage_erect"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.percentage_erect}
              />
              <Input
                title="Percentage Dismantle"
                id="percentage_dismantle"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.percentage_dismantle}
              />

            </div>
            <div className="w-1/2">
              <Input
                title="Total Hours"
                id="total_hours"
                type="number"
                // handleChange={handleChange}
                // handleBlur={handleBlur}
                value={values.total_hours}
              />
            </div>
            <div className="w-full">
              <div className="px-3 py-3 mb-3 pb-3 sm:flex sm:items-center sm:justify-between">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Changelog</h2>
              </div>

              <div className="px-1">
                <DataTable
                  // ref={dt}
                  value={tasksQuery.data.history}
                  loading={tasksQuery.isLoading}
                  // paginator
                  // paginatorPosition="top|bottom|both"
                  showGridlines
                  rows={25}
                  // rowsPerPageOptions={[25, 50, 100]}
                  // dataKey="id"
                  // responsiveLayout="scroll"
                  emptyMessage="No Changes Found."
                >
                  <Column
                    header="Date"
                    field="Date"
                  />
                  <Column
                    header="Erect"
                    field="newData.percentage_erect"
                  />
                  <Column
                    header="Dismantle"
                    field="newData.percentage_dismantle"
                  />
                </DataTable>
              </div>
            </div>
          </SideModal>
        )}
      </Formik>
    </div>
  );
}
