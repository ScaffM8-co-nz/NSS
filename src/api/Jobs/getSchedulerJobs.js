import { useQuery } from "react-query";
import supabase from "../supabase";

async function fetchAllSchedulerJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, clients:client_id( id, client_name )")
    .match({status: 'Active'},{visits_created:true})
    .not('end_date', 'eq', "")
    .order("id", { ascending: true });
  // .select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useSchedulerJobs() {
  return useQuery("jobs", () => fetchAllSchedulerJobs());
}
