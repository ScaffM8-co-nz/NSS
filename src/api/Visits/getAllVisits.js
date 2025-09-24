import { useQuery } from "react-query";
import supabase from "../supabase";

async function fetchAllVisits() {
  const { data, error } = await supabase
    .from("visits")
    .select("*, staff:team_leader_id(id, staff_name), jobs:job_id(id, job_num, site) ")
    .order("job_id", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useVisits() {
  return useQuery("visits", () => fetchAllVisits());
}
