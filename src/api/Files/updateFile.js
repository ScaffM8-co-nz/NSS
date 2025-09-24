import { useMutation, useQueryClient } from "react-query";
import supabase from "../supabase";

import { useNotificationStore } from "../../store/notifications";

async function updateFile({ file, fileId }) {
  const { data, error } = await supabase.from("files").update(file).match({ id: fileId });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useUpdateFile() {
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  return useMutation((payload) => updateFile(payload), {
    onSuccess: () => {
      queryClient.refetchQueries("files");
      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully updated file.`,
      });
    },
    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed to update file",
        content: err?.message,
      });
    },
    mutationFn: updateFile,
  });
}
