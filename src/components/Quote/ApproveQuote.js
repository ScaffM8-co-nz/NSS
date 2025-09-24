import { CheckIcon } from "@heroicons/react/outline";
import { useState } from "react";
import moment from "moment";
import { Input, TextArea, Button, ConfirmationDialog } from "../../common";
import { QuotesApi, WeeklyHireApi, JobsApi } from "../../api";
import supabase from "../../api/supabase";

export const ApproveQuote = ({ quoteId, status, quotePayload }) => {
  const user = supabase.auth.user();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState({
    approvedBy: user?.user_metadata?.name || "",
    clientApproved: "",
    description: "",
    status: "Approved",
  });
  const updateApproveStatus = QuotesApi.useUpdateQuoteStatus(quoteId, state);
  const createJobFromQuote = QuotesApi.useCreateJobFromQuote();
  const createJobTasksFromQuote = QuotesApi.useCreateJobTasksFromQuote();
  const createHireInvoices = WeeklyHireApi.useCreateHire();
  const createEdInvoiceMutation = JobsApi.useCreateEdInvoice();

  const handleInputChange = (event) => {
    const { id, value } = event.target;

    setState({
      ...state,
      [id]: value,
    });
  };

  return (
    <ConfirmationDialog
      isDone={createJobTasksFromQuote.isSuccess}
      icon="info"
      title="Approve Quote"
      body="Are you sure you wish to approve this quote? This action will create a job with a list of tasks."
      triggerButton={
        <button
          type="button"
          id={quoteId}
          className={
            status !== "Approved" && status !== "Rejected"
              ? `ml-3 inline-flex items-center text-sm font-medium focus:outline-none hover:text-green-400`
              : "ml-3 inline-flex items-center text-sm text-gray-200"
          }
          disabled={status === "Approved" || status === "Rejected"}
        >
          <CheckIcon
            className={
              status !== "Approved" && status !== "Rejected"
                ? "-ml-0.5 mr-2 h-4 w-4 text-green-400"
                : "-ml-0.5 mr-2 h-4 w-4 text-green-100"
            }
            aria-hidden="true"
          />
          Approve
        </button>
      }
      confirmButton={
        <Button
          isLoading={isLoading}
          variant="approve"
          onClick={async (e) => {
            const { quote_num } = quotePayload
            if (quotePayload.quote_type === "Variation" && quotePayload.variation_job_id) {
              setIsLoading(true)
              // Just create tasks
              const quoteLines = quotePayload?.quote_lines;
              const quoteAddons = quotePayload?.quote_addons;
              const formatTaskPayload = quoteLinesToJobTasks(
                quoteLines,
                quotePayload.variation_job_id,
                "Variation",
                quotePayload.id,
                quotePayload.PO_Number
              );
              let taskCreated = []
              try {
                taskCreated = await createJobTasksFromQuote.mutateAsync({ formatTaskPayload });
              } catch (err) {
                console.log("ERROR CREATING TASKS", err);
              }
              const formatInvoices = quoteLinesToWeeklyInvoices(
                quoteLines,
                quotePayload.variation_job_id,
                taskCreated
              );

              try {
                await createHireInvoices.mutateAsync(formatInvoices);
              } catch (err) {
                console.log("ERROR CREATING HIRE INVOICES", err);
              }

              const formatEDInvoices = quoteLinesToEdInvoices(
                quoteLines,
                quotePayload.variation_job_id,
                taskCreated,
                quote_num
              );

              try {
                await createEdInvoiceMutation.mutateAsync(formatEDInvoices);
              } catch (err) {
                console.log("ERROR CREATING ED INVOICES", err);
              }

              try {
                await updateApproveStatus.mutateAsync();
              } catch (err) {
                console.log("ERROR UPDATING STATUS", err);
              }

              const formatedinvoices = quoteAddonsToEdInvoices(quoteAddons, quotePayload.variation_job_id);

              try {
                await createEdInvoiceMutation.mutateAsync(formatedinvoices);
              } catch (err) {
                console.log("ERROR CREATING ED INVOICES", err);
              }
              setIsLoading(false)
            } else {
              setIsLoading(true);
              const fields = [
                [quotePayload.street_1],
                [quotePayload.street_2],
                [quotePayload.city],
              ];
              const addressFormat = fields
                .map((part) => part.filter(Boolean).join(" "))
                .filter((str) => str.length)
                .join(", ");
              const jobPayload = {
                client_id: quotePayload?.client,
                site: addressFormat || "",
                quote_id: quoteId || null,
                start_date: moment().format("DD/MM/YYYY"),
                end_date: moment().add(3, "M").format("DD/MM/YYYY"),
                job_status: "Pending Handover",
                status: "Active",
                clientType: quotePayload?.clientType,
                branding: quotePayload?.branding
              };
              try {
                await updateApproveStatus.mutateAsync();
                const createdJob = await createJobFromQuote.mutateAsync(jobPayload);

                const quoteLines = quotePayload?.quote_lines;
                const quoteAddons = quotePayload?.quote_addons;

                if (quoteLines?.length && createdJob?.id) {
                  const formatTaskPayload = quoteLinesToJobTasks(quoteLines, createdJob.id);

                  const taskCreated = await createJobTasksFromQuote.mutateAsync({ formatTaskPayload });

                  const formatInvoices = quoteLinesToWeeklyInvoices(quoteLines, createdJob.id, taskCreated);

                  await createHireInvoices.mutateAsync(formatInvoices);

                  const formatEDInvoices = quoteLinesToEdInvoices(quoteLines, createdJob.id, taskCreated, quote_num);

                  await createEdInvoiceMutation.mutateAsync(formatEDInvoices);
                }

                if (quoteAddons?.length && createdJob?.id) {
                  const formatedinvoices = quoteAddonsToEdInvoices(quoteAddons, createdJob?.id);

                  await createEdInvoiceMutation.mutateAsync(formatedinvoices);
                }

                setIsLoading(false);
              } catch (err) {
                console.log("ERROR ", err);
              }
            }
          }}
        >
          Approve
        </Button >
      }
    >
      <div className="flex">
        <div className="w-1/2">
          <Input
            title="Approved By"
            id="approvedBy"
            type="text"
            value={state.approvedBy}
            handleChange={handleInputChange}
          />
        </div>
        <div className="w-1/2">
          <Input
            title="Client Who Approved"
            id="clientApproved"
            type="text"
            value={state.clientApproved}
            handleChange={handleInputChange}
          />
        </div>
      </div>
      <TextArea
        title="Confirmation Text"
        id="description"
        type="text"
        value={state.description}
        handleChange={handleInputChange}
      />
    </ConfirmationDialog >
  );
};

function quoteLinesToJobTasks(lines, jobId, type, quoteId, PO_Number) {
  if (!type) {
    type = "New";
  }
  console.log("lines", lines);
  const linesResult = [];
  for (let i = 0; i < lines.length; i++) {
    const quantity = Number(lines[i].quantity) || 1;
    for (let j = 0; j < quantity; j++) {
      linesResult.push({
        job_id: jobId,
        task_type: type,
        zone: lines[i].zone,
        zone_label: lines[i].zone_label,
        type: lines[i].type,
        description: lines[i].description,
        total_hours: (lines[i].erect_dismantle / 60).toFixed(2),
        variation_quote_id: quoteId,
        PO_Number
      });
    }
  }
  return linesResult;
}

function quoteAddonsToEdInvoices(quote_addons, job_id) {
  return quote_addons.map((row) => {
    const invoice = {
      zone: "",
      zone_label: "",
      type: row?.type,
      description: row?.description,
      erect_percent: 0,
      erect: 0,
      dismantle_percent: 0,
      dismantle: 0,
      ed_total: row?.total || 0,
      complete_percent: 100,
      invoiced: row?.total || 0,
      balance: row?.total || 0,
      last_invoice: 0,
      status: "Pending",
      job_id
    };
    return invoice
  });

}

function quoteLinesToWeeklyInvoices(lines, jobId, taskCreated) {
  console.log("lines", lines);
  let iteratorTask = 0;
  const linesResult = [];
  for (let i = 0; i < lines.length; i++) {
    const quantity = Number(lines[i].quantity) || 1;
    for (let j = 0; j < quantity; j++) {
      linesResult.push({
        job_id: jobId,
        zone: lines[i].zone,
        zone_label: lines[i].zone_label,
        type: lines[i].type,
        description: lines[i].description,
        weekly_hire_rate: lines[i].weekly_fee,
        task_id: taskCreated[iteratorTask]?.id || 0
      });
      iteratorTask++;
    }
  }
  return linesResult;
}

function quoteLinesToEdInvoices(lines, jobId, taskCreated, quote_num) {
  console.log("lines", lines);
  let iteratorTask = 0;
  const linesResult = [];
  for (let i = 0; i < lines.length; i++) {
    const quantity = Number(lines[i].quantity) || 1;
    for (let j = 0; j < quantity; j++) {
      linesResult.push({
        job_id: jobId,
        task_id: taskCreated[iteratorTask]?.id || 0,
        PO_Number: "",
        zone: lines[i].zone,
        zone_label: lines[i].zone_label,
        type: lines[i].type,
        description: lines[i].description,
        Quote_Number: quote_num,
        erect_percent: 0, dismantle_percent: 0, complete_percent: 0,
        erect: lines[i].erect_dismantle * 0.7, dismantle: lines[i].erect_dismantle * 0.3,
        invoiced: 0, balance: 0, ed_total: lines[i].erect_dismantle
      });
      iteratorTask++;
    }
    linesResult.push({
      job_id: jobId,
      task_id: 0,
      PO_Number: "",
      zone: lines[i].zone,
      zone_label: lines[i].zone_label,
      type: lines[i].type,
      description: `Transport of ${lines[i].description}`,
      Quote_Number: quote_num,
      erect_percent: 0, dismantle_percent: 0, complete_percent: 0,
      erect: lines[i].transport * 0.7, dismantle: lines[i].transport * 0.3,
      invoiced: 0, balance: 0, ed_total: lines[i].transport
    });
  }
  return linesResult;
}