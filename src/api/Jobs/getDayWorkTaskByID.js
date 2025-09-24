import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchDayWorkTaskByID(id) {
  const { data, error } = await supabase
    .from("job_tasks")
    .select("*")
    .match({id})
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useFetchDayWorkTaskByID(id) {
  return useQuery({
    queryKey: ["dayworktaskid", id],
    queryFn: () => fetchDayWorkTaskByID(id),
  });
}