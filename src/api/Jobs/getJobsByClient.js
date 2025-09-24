import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchJobsByClient(clientID) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, clients:client_id( id, client_name ), staff:supervisor( id,staff_name )")
    .order("id", { ascending: true })
    .eq("client_id", clientID);
    // .select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useJobs(clientID) {
    return useQuery({
        queryKey: ["quote", clientID],
        queryFn: () => fetchJobsByClient(clientID),
      });
}
