import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import supabase from "../../supabase";
import { useNotificationStore } from "../../../store/notifications";

export async function createJobTasksFromQuote({formatTaskPayload}) {
  
  const { data, error } = await supabase.from("job_tasks").insert(formatTaskPayload).select();

  if (error) throw new Error(error.message);
  const res = await updateAppenateTask(data);
  return data;
}

export const useCreateJobTasksFromQuote = () =>
  useMutation((props) => createJobTasksFromQuote(props), {
    onSuccess: (data) => data,
    onError: (error) => error,
    mutationFn: createJobTasksFromQuote,
  });


async function updateAppenateTask(tasks) {
  const taskPayload = [];

  tasks.map((task) =>
    taskPayload.push([
      task.id,
      task.job_id || "",
      task.zone || "",
      task.zone_label || "",
      `${task.type} - ${task.description}`,
      task.description || "",
      task.complete || "",
    ]),
  );
  return axios.post("https://scaff-m8-server.herokuapp.com/api/data-sync", {
    id: "64cbf15a-a268-4ed8-ade3-ade3017066e4",
    data: taskPayload,
  });
}