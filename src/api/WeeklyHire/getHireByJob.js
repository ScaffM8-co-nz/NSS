import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchHire(id) {
  const { data, error } = await supabase.from("weekly_hire_invoices").select("*").eq("job_id", id);
  if (error) {
    throw new Error(error.message);
  }
  return formatPayload(data);
}

export function useFetchHireByJob(jobId) {
  return useQuery(["weeklyHires", jobId], () => fetchHire(jobId));
}

function formatPayload(data) {
  return [...(data || [])].map((d) => {
    d.date_on_hire = d.date_on_hire ? convertDate(d.date_on_hire) : null;
    d.completed_date = d.completed_date ? convertDate(d.completed_date) : null;
    return d;
  });
}

function convertDate(date) {
  const dateParts = date.split("/");
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}
