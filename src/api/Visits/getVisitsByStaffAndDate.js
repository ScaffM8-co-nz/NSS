import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchAllVisitsByStaffAndDate(staffID, staffName, date ) {

  const visitsAnsw = await supabase
    .from("visits")
    .select("*, staff:team_leader_id(id, staff_name), jobs:job_id(id, site) ")
    .contains("staff_ids", [staffID])
    .eq("date",date)
    .order("id", { ascending: false });
  if (visitsAnsw.error) {
    console.log('error:', visitsAnsw.error);
    throw new Error(visitsAnsw.error.message);
  }
  const visitIds = visitsAnsw.data.map(visit => visit.id);

  const  visitTimesheets = await supabase
    .from("visit_timesheets")
    .select("*")
    .in("visit_id", visitIds);

    if(visitTimesheets.error) {
      console.log('error:', visitTimesheets.error);
      throw new Error(visitTimesheets.error.message);
    }

    const data = visitTimesheets.data.map( visitTimesheet => ({date,
      job_id: visitTimesheet.job_id,
      time_on: visitTimesheet.time_in,
      time_off: visitTimesheet.time_off
    }))

  return data;
}

export function useGetVisitsByStaffAndDate(staffId, staffName, date) {
  return useQuery("visits", () => fetchAllVisitsByStaffAndDate(staffId, staffName, date ));
}
