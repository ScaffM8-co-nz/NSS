import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchAllDayWorkTask(jobId) {

  const { data, error } = await supabase
    .from("job_tasks")
    .select("*")
    .eq("job_id", Number(jobId))
    .eq("task_type", "Day-Work-Task")
    .order("id", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useFetchDayWorkTask(jobId) {
  return useQuery("day_work_task", () => fetchAllDayWorkTask(jobId));
}