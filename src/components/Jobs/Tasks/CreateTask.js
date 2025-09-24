/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { SideModal, Input, TextArea, Dropdown, Address, DateSelect } from "../../../common";

import { JobsApi,WeeklyHireApi } from "../../../api";

const typeOptions = [
  { value: "Scaffolding", label: "Scaffolding" },
  { value: "Stairs", label: "Stairs" },
  { value: "Roof", label: "Roof" },
  { value: "Propping", label: "Propping" },
  { value: "Edge Protection", label: "Edge Protection" },
  { value: "Shrinkwrap", label: "Shrinkwrap" },
  { value: "Geda 1200", label: "Geda 1200" },
];

export function CreateTask({ jobId, open, setOpen }) {
  const createTaskMutation = JobsApi.useCreateTask();
  const createWeeklyhireMutation = WeeklyHireApi.useCreateHire();

  return (
    <div>
      <Formik
        initialValues={{
          zone: "",
          zone_label: "",
          type: "",
          description: "",
          percentage_complete: 0,
          total_hours: "",
        }}
        onSubmit={async (values, { resetForm }) => {
          const hours = Number(values.total_hours);
          const fixed = hours.toFixed(2);
          const taskPayload = {
            job_id: Number(jobId),
            task_type: "New",
            zone: values.zone,
            zone_label: values.zone_label,
            type: values.type,
            description: values.description,
            percentage_complete: Number(values.percentage_complete),
            total_hours: String(fixed),
          };

          try {
            const task = await createTaskMutation.mutateAsync(taskPayload);

            createWeeklyhireMutation.mutateAsync({
              task_id: task[0].id,
              job_id: Number(jobId),
              zone: values.zone,
              zone_label: values.zone_label,
              type: values.type,
              description: values.description,
              weekly_hire_rate:0
            });
            
            setOpen(false);
            resetForm();
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
            heading="Create Task"
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            isLoading={isSubmitting}
            formType="create"
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
            <div className="w-1/2">
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
                title="Percentage CompleteS"
                id="percentage_complete"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.percentage_complete}
              />
              <Input
                title="Total Hours"
                id="total_hours"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.total_hours}
              />
            </div>
          </SideModal>
        )}
      </Formik>
    </div>
  );
}
