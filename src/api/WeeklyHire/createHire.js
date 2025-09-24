import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import supabase from "../supabase";

import { useNotificationStore } from "../../store/notifications";

async function createHire(hire) {
  const { data, error } = await supabase.from("weekly_hire_invoices").insert(hire);

  if (error) {
    throw new Error(error.messge);
  }
  return data;
}

export function useCreateHire() {
  const { addNotification } = useNotificationStore();

  const queryClient = useQueryClient();

  return useMutation((hire) => createHire(hire), {
    onSuccess: () => {
      queryClient.refetchQueries("weeklyHires");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully created hire invoice.`,
      });
    },
    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed creating hire invoice",
        content: err?.message,
      });
    },
    mutationFn: createHire,
  });
}
