import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";
import { useNotificationStore } from "../../store/notifications";

export async function createEDinvoice(invoice) {
  const { data, error } = await supabase.from("edinvoices").insert(invoice);

  if (error) {
    throw new Error(error.messge);
  }

  return data;
}

export function useCreateEdInvoice() {
  const { addNotification } = useNotificationStore();

  const queryClient = useQueryClient();

  return useMutation((invoice) => createEDinvoice(invoice), {
    onSuccess: () => {
      queryClient.refetchQueries("invoices");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully created ED Invoice.`,
      });
    },
    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed creating ED Invoice",
        content: err?.message,
      });
    },
    mutationFn: useCreateEdInvoice,
  });
}