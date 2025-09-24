/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import moment from "moment";
import { SideModal, Input, TextArea, Spinner, Dropdown } from "../../common";
import { JobsApi, ContactsApi } from "../../api";
import supabase from "../../api/supabase";
import { CreateFile } from "./FileUpload";

let RequesterOptions = [{ value: "Loading", label: "Loading" }];

export function CreateEditDayWorkTask({ job_id, DayWorkTaskID, open, setOpen }) {
  const createDayWorkTaskMutation = JobsApi.useCreateDayWorkTask();
  const UpdateDayWorkTaskMutation = JobsApi.useUpdateupdateDayWorkTask();

  JobsApi.fetchJob(job_id).then(data => {
    ContactsApi.fetchAllContacts(data.client_id).then(contacts => {
      RequesterOptions = contacts.map(e => ({ value: e.name, label: e.name }));
    });
  });

  const [dayWorkTaskData, setDayWorkTaskData] = useState(null)

  useEffect(() => {
    if (DayWorkTaskID && !dayWorkTaskData) {
      JobsApi.fetchDayWorkTaskByID(DayWorkTaskID).then((data) => setDayWorkTaskData(data[0]))
    }
  });

  if (DayWorkTaskID && !dayWorkTaskData) {
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
          PO_Number: dayWorkTaskData?.PO_Number || "",
          Requester: dayWorkTaskData?.Requester || "",
          Workers: dayWorkTaskData?.Workers || 0,
          total_hours: dayWorkTaskData?.total_hours || 0,
          Rate: dayWorkTaskData?.Rate || 60,
          description: dayWorkTaskData?.description || "",
          pink_slip_number: dayWorkTaskData?.dayWorkTaskData,
          photo_of_slip: dayWorkTaskData?.photo_of_slip
        }}
        onSubmit={async (values, { resetForm }) => {
          const task_type = "Day-Work-Task"
          const zone_label = "Day-Work-Task"
          const { PO_Number, Requester, description, pink_slip_number, photo_of_slip } = values;
          let { Workers, total_hours, Rate, } = values;

          Workers = Number(Workers);
          total_hours = Number(total_hours);
          Rate = Number(Number(Rate).toFixed(2));

          const total_Daywork = (Workers * total_hours * Rate)

          let dayWorkTaskPayload = {};

          const created_at = moment().toISOString();

          if (DayWorkTaskID) {
            dayWorkTaskPayload = {
              id: DayWorkTaskID,
              // PO_Number,
              created_at,
              description,
              // Requester,
              Workers,
              total_hours,
              Rate,
              total_Daywork,
              pink_slip_number,
              photo_of_slip
            };
          }
          else {
            const lastSerial = await supabase
              .from("job_tasks")
              .select("*")
              .eq("task_type", "Day-Work-Task")
              .match({ job_id });

            dayWorkTaskPayload = {
              PO_Number,
              task_id: `${1000 + Number(job_id)}-DWS${lastSerial.data.length + 1}`,
              task_type,
              zone_label,
              job_id,
              created_at,
              description,
              Requester,
              Workers,
              total_hours,
              Rate,
              total_Daywork,
              pink_slip_number,
              photo_of_slip
            };
          }

          try {
            if (DayWorkTaskID) {
              await UpdateDayWorkTaskMutation.mutateAsync(dayWorkTaskPayload);
            }
            else {
              await createDayWorkTaskMutation.mutateAsync(dayWorkTaskPayload);
            }

            setDayWorkTaskData([]);
            resetForm();
            setOpen(false);

          } catch (err) {
            console.log("ERROR CREATING/UPDATING Day Work Task", err);
          }
        }}
        validate={(values) => {
          const errors = {};

          if (!values.PO_Number) errors.PO_Number = "PO Number Is Required.";
          if (!values.Requester) errors.Requester = "Requester Is Required.";
          if (values.Workers <= 0) errors.Workers = "Workers Is Required.";
          if (values.total_hours <= 0) errors.total_hours = "Total Hours Is Required.";
          if (values.Rate <= 0) errors.Rate = "Rate Is Required.";
          if (!values.description) errors.description = "description Is Required.";
          // if (!values.photo_of_slip) errors.photo_of_slip = "Photo Of Slip Is Required.";
          // if (!values.pink_slip_number) errors.pink_slip_number = "Pink Slip Number Is Required.";
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
            heading={`${!DayWorkTaskID ? "Create new" : "Edit"}`}
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            isLoading={isSubmitting}
            formType={`${!DayWorkTaskID ? "create" : "update"}`}
          >
            { !DayWorkTaskID && (
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
            )}
            <div className="flex items-center">
              <Input
                title="Workers"
                id="Workers"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.Workers}
                value={values.Workers}
              />
              <Input
                title="Hours"
                id="total_hours"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.total_hours}
                value={values.total_hours}
              />
            </div>
            <div>
              <Input
                title="Rate"
                id="Rate"
                type="number"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.Rate}
                value={values.Rate}
              />
            </div>
            <div>
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
                title="pink slip number"
                id="pink_slip_number"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                error={errors.pink_slip_number}
                value={values.pink_slip_number}
              />
            </div>
            <span className="text-black-400 pl-2">photo_of_slip</span>
            <div className="flex items-center">
              <CreateFile field="photo_of_slip" setFieldValue={setFieldValue} />
            </div>
          </SideModal>
        )}
      </Formik>
    </div >
  );
}