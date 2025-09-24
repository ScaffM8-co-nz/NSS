import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchEdInvoices(id) {
  const { data, error } = await supabase
    .from("edinvoices")
    .select("*")
    .eq("job_id", id)
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useFetchEdInvoices(job_id) {
  return useQuery({
    queryKey: ["job_id", job_id],
    queryFn: () => fetchEdInvoices(job_id),
  });
}