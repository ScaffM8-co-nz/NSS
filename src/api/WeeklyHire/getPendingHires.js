import { useQuery } from "react-query";
import supabase from "../supabase";

async function fetchAllHiresPending() {
  const { data, error } = await supabase
    .from("weekly_hire_invoices")
    .select("*, jobs:job_id(id, job_num, site, branding, clientType, clients:client_id( id, client_name )) ")
    .match({ "status": "Pending" })
    .order("job_id", { ascending: false })
    .order("description", { ascending: true })
    .order("date_on_hire", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return formatPayload(data);
}

export function useHiresPending() {
  return useQuery("weeklyHires", () => fetchAllHiresPending());
}

function formatPayload(data) {
  return [...(data || [])].map((d) => {
    d.date_on_hire = d.date_on_hire ? convertDate(d.date_on_hire) : null;
    d.completed_date = d.completed_date ? convertDate(d.completed_date) : null;
    d.job_display = d.job_id ? `${d.jobs.job_num} - ${d.jobs.site}` : "";
    return d;
  });
}

function convertDate(date) {
  const dateParts = date.split("/");
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

