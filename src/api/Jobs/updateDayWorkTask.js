import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";
import { useNotificationStore } from "../../store/notifications";

async function updateDayWorkTask(invoice) {
  const { id } = invoice
  const { data, error } = await supabase.from("job_tasks")
    .update(invoice)
    .match({ id });

  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export const useUpdateupdateDayWorkTask = () => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation((task) => updateDayWorkTask(task), {
    onSuccess: (data) => {
      queryClient.refetchQueries("day_work_task");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully updated Day Work Task.`,
      });
    },

    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed updating Day Work Task",
        content: err?.message,
      });
    },
    mutationFn: updateDayWorkTask,
  });
};