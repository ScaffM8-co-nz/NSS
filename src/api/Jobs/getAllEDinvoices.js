import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchAllEdInvoices() {
  const { data, error } = await supabase
    .from("edinvoices")
    .select("*, jobs:job_id(id, job_num, job_num, site, branding, clientType, clients:client_id( id, client_name ))")
    .order("job_id", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}