import { useQuery } from "react-query";
import supabase from "../supabase";


export async function fetchVisitTimesheetsByStaffAndDate(staffId, date) {
    const { data, error } = await supabase
    .from("visits")
    .select("*")
    .contains("staff_ids", [staffId])
    .order("id", { ascending: false });
  if (error) {
    console.log('error:', error);
    throw new Error(error.message);
  }

  return data
}