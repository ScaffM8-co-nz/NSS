import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import supabase from "../supabase";

import { useNotificationStore } from "../../store/notifications";

export async function updateHire({ hire, hireId }) {
  const { data, error } = await supabase
    .from("weekly_hire_invoices")
    .update(hire)
    .match({ id: hireId });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const useUpdateHire = () => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation((hire) => updateHire(hire), {
    onSuccess: (data) => {
      queryClient.refetchQueries("weeklyHires");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully updated hire invoice.`,
      });
    },

    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed updating hire invoice",
        content: err?.message,
      });
    },
    mutationFn: updateHire,
  });
};
