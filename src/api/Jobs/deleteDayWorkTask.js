import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";
import { useNotificationStore } from "../../store/notifications";

async function deleteDayWorkTask(id) {
  const { data, error } = await supabase.from("edinvoices")
  .delete()
  .match({ id });

  if (error) {
    throw new Error(error.messge);
  }
  return data;
}

export function useDeleteDayWorkTask() {
  const { addNotification } = useNotificationStore();

  const queryClient = useQueryClient();

  return useMutation((id) => deleteDayWorkTask(id), {
    onSuccess: () => {
      queryClient.refetchQueries("dayworktask");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully Delete Day Work Task.`,
      });
    },
    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed deleting Day Work Task",
        content: err?.message,
      });
    },
    mutationFn: useDeleteDayWorkTask,
  });
}
