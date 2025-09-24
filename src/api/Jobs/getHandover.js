import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchAllHandover() {
  const { data, error } = await supabase
    .from("job_handover")
    .select(
      `*,
      staff:staff(id, staff_name)
    `,
    )
    // .match({id:49})
  if (error) {
    throw new Error(error.message);
  }
  console.log(data)
  return data;
}

export function usefetchAllHandover() {
    return useQuery({
      queryKey: ["handover"],
      queryFn: () => fetchAllHandover(),
    });
  }
