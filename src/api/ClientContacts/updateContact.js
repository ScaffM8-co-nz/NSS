import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";

import { useNotificationStore } from "../../store/notifications";

async function updateContact({contact,contactId}) {
    const { data, error } = await supabase
    .from("client_contacts")
    .update(contact)
    .match({id:contactId});

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function useupdateContact() {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation((contact,contactId) => updateContact(contact,contactId), {
    onSuccess: () => {
      queryClient.refetchQueries("client_contacts");
      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully Contact Updated.`,
      });
    },
    onError: (err) => {

      addNotification({
        isSuccess: false,
        heading: "Failed updating contact",
        content: err?.message,
      });
    },
    mutationFn: updateContact,
  });
}
