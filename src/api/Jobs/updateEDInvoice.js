import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";

import { useNotificationStore } from "../../store/notifications";

async function updateInvoice(invoice) {
  const { id } = invoice
  const { data, error } = await supabase.from("edinvoices")
    .update(invoice)
    .match({ id });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const useUpdateEdInvoice = () => {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation((invoice) => updateInvoice(invoice), {
    onSuccess: (data) => {
      queryClient.refetchQueries("invoices");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully updated ED Invoice.`,
      });
    },

    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed updating ED Invoice",
        content: err?.message,
      });
    },
    mutationFn: updateInvoice,
  });
};