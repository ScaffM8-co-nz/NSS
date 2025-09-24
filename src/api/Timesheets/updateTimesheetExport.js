import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";

export async function updateTimesheetExport(timesheets) {
  const { data, error } = await supabase.from("timesheets").upsert(timesheets);

  if (error) throw new Error(error.message);
  return data;
}

export function useUpdateTimesheetExport() {
  const queryClient = useQueryClient();

  return useMutation(({ timesheets }) => updateTimesheetExport(timesheets), {
    onSuccess: () => {
      queryClient.refetchQueries("timesheets");
    },
  });
}
