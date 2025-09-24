import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchAllStaff() {
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("staff_name", { ascending: true })
    // .eq("status", "Active");

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useStaff() {
  return useQuery("staff", () => fetchAllStaff());
}
