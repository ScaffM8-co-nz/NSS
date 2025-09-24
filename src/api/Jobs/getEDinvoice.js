import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchEdInvoice(id) {
  const { data, error } = await supabase
    .from("edinvoices")
    .select("*")
    .eq("id", id)
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useFetchEdInvoices(edinvoice_id) {
  return useQuery({
    queryKey: ["edinvoice_id", edinvoice_id],
    queryFn: () => fetchEdInvoice(edinvoice_id),
  });
}