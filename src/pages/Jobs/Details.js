import React, { useState } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { JobsApi } from "../../api";
import supabase from "../../api/supabase";
import { TwoColumnDetails, Section } from "../../common/Details";
import { Spinner, Tabs } from "../../common";
import { JobTasks } from "../../components/Jobs/Tasks/JobTaskTable";
import { HandoverForm } from "../../components/Jobs/Handover";
import { FileList } from "../../components/Files";
import { VisitsMain } from "./Visits";
import { VariationTasks } from "../../components/Jobs/Tasks";
import { VisitTimesheetTable } from "../../components/Jobs/VisitTimesheets";
import { TagTable } from "../../components/Jobs/TagsTable";
import { HireInvoices } from "../../components/Jobs/HireInvoices";
import { EDInvoices } from "../../components/Jobs/EDInvoices"
import { DayWorkTask } from "../../components/Jobs/DayWorkTask";
import { JobvsHours } from "../../components/Jobs/JobVShours";
import { ExportTaskByJob } from "../../components/Jobs";

export const JobDetails = () => {
  const user = supabase.auth.user();
  const { jobId } = useParams(0);
  const location = useLocation();
  const history = useHistory();

  const [tabIndex, setTabIndex] = useState(1);

  const items = [
    { label: "Tasks", id: 1 },
    { label: "Visits", id: 2 },
    { label: "Visit Timesheets", id: 3 },
    { label: "Scaffold Tags", id: 4 },
    { label: "Weekly Hire Invoices", id: 5 },
    { label: "ED Invoices", id: 6 },
    { label: "Job Files", id: 7 },
    // { label: "Quoted hours vs. Actual hours", id: 8 },
  ];

  const { data, isLoading } = JobsApi.useFetchJob(jobId);

  const quoteLink = () => {
    const path = `quotes/${data.quote_id}/details`;
    history.push("/");
    history.push(path);
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  console.log("data >>> ", data);

  const editPage = {
    pathname: `/jobs/${jobId}/editJob`,
    state: { background: location, name: "editJob" },
  }

  const handover = data?.job_handover?.[0];

  return (
    <div className="w-full mx-auto mt-8 mb-28">
      <TwoColumnDetails heading="Job Details"
        editBtn="Edit Job" editLink={editPage}
        isEditable={
          (user.email === "clifton@nss.co.nz") || (user.email === "shaun@nss.co.nz") || (user.email === "accounts@nss.co.nz") || (user.email === "keith@techenabled.nz") || (user.email === "samuel@soluntech.com") ?
            true :
            false
        }
      >
        <Section title="" content="" />
        <Section title="" content={<div><ExportTaskByJob jobId={jobId} /></div>} />
        <Section title="Job #" content={data.job_num} />
        <Section title="Client Type" content={data.clientType} />
        <Section title="Client" content={data.clients?.client_name} />
        <Section title="Site" content={data.site} />
        <Section title="Start Date" content={data.start_date} />
        <Section title="Finish Date" content={data.end_date} />

        <h2 className="py-2 text-lg font-medium leading-5 tracking-wide">H&S Officer</h2>
        <div />
        <Section title="H&S Officer" content={handover?.hs_officer} />
        <Section title="H&S Officer Phone #" content={handover?.hs_officer_phone} />
        <Section title="H&S Officer Email" content={handover?.hs_officer_email} />

        <div />
        <h2 className="py-2 text-lg font-medium leading-5 tracking-wide">Client Site Foreman</h2>
        <div />
        <Section title="Client Site Foreman" content={handover?.site_forman} />
        <Section title="Client Site Foreman Phone #" content={handover?.site_forman_phone} />
        <Section title="Client Site Foreman Email" content={handover?.site_forman_email} />
        <Section title="Invoice Type" content={handover?.invoiceType} />

        <Section
          title="Job Status"
          content={
            <div>
              {data.job_status}
              <HandoverForm jobId={jobId} handover={data?.job_handover} client_id={data.client_id} />
            </div>
          }
        />
        <Section title="Active" content={data.status} />
      </TwoColumnDetails>
      {/* 
      data?.quote_id && (
        <div className="px-8">
          <button
            type="button"
            onClick={quoteLink}
            className="flex items-center text-blue-600 text-md hover:text-blue-800"
          >
            <CursorClickIcon className="w-4 h-4" />
            <span className="pl-2">View Quote</span>
          </button>
        </div>
      ) */}

      <div className="px-8">
        <Tabs tabIndex={tabIndex} setTabIndex={setTabIndex} tabs={items} />
      </div>
      {
        tabIndex === 1 && (
          <>
            <JobTasks jobId={jobId} tasks={data?.job_tasks} quote_id={data?.quote_id} />
            <VariationTasks jobId={jobId} />
            <DayWorkTask job_ID={jobId} />
          </>
        )
      }
      {
        tabIndex === 2 && (
          <div className="mb-8">
            <VisitsMain jobId={jobId} />
          </div>
        )
      }
      {
        tabIndex === 3 && (
          <div className="mb-8">
            <VisitTimesheetTable jobId={jobId} />
          </div>
        )
      }

      {
        tabIndex === 4 && (
          <div className="mb-8">
            <TagTable jobId={jobId} />
          </div>
        )
      }
      {
        tabIndex === 5 && (
          <div className="mb-8">
            <HireInvoices jobId={jobId} />
          </div>
        )
      }
      {
        tabIndex === 6 && (
          <div className="mb-8">
            <EDInvoices job_ID={jobId} />
          </div>
        )
      }
      {
        tabIndex === 7 && (
          <div className="mb-8">
            <FileList title="Job Notes & Files" column="job_id" type="jobs" id={jobId} />
          </div>
        )
      }
      {
        tabIndex === 8 && (
          <div className="mb-8">
            <JobvsHours jobId={jobId} tasks={data?.job_tasks} quote_id={data?.quote_id} />
          </div>
        )
      }

    </div >
  );
};
