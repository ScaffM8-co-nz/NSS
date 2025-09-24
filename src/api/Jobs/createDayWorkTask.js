import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import supabase from "../supabase";
import { useNotificationStore } from "../../store/notifications";

async function createDayWorkTask(task) {
  const { data, error } = await supabase.from("job_tasks").insert(task);

  if (error) {
    throw new Error(error.messge);
  }
  createAppenateTask(data)
  return data;
}

export function useCreateDayWorkTask() {
  const { addNotification } = useNotificationStore();

  const queryClient = useQueryClient();

  return useMutation((task) => createDayWorkTask(task), {
    onSuccess: () => {
      queryClient.refetchQueries("day_work_task");

      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: `Successfully created Day Work Task.`,
      });
    },
    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failed creating Day Work Task",
        content: err?.message,
      });
    },
    mutationFn: useCreateDayWorkTask,
  });
}

async function createAppenateTask(jobs) {
  const tasksPayload = [];

  jobs.map((task) =>
    tasksPayload.push([
      task.id,
      task?.job_id || "",
      task.zone || "",
      task.zone_label || "",
      task.type || "",
      task.description || "",
      task.total_hours || "",
    ]),
  );

  return axios.post("https://scaff-m8-server.herokuapp.com/api/data-sync", {
    id: "64cbf15a-a268-4ed8-ade3-ade3017066e4",
    data: tasksPayload,
  });
}