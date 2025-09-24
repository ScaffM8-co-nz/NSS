import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import moment from "moment";
import supabase from "../../supabase";
import { checkJobStatus } from "./checkJobStatus"
import { useNotificationStore } from "../../../store/notifications";

async function updateTask({ payload, taskId }) {
  const Date = moment().format("DD/MM/YYYY");
  const Month = moment().format("MMMM");

  const { data, error } = await supabase.from("job_tasks").update(payload).match({ id: taskId });

  const { history } = data[0]
  history.push({
    Date, Month,
    newData: payload
  })

  supabase.from("job_tasks").update({ history }).match({ id: taskId }).then(dataOfUpdate => console.log(dataOfUpdate))

  supabase.from("edinvoices").select("*").match({ task_id: taskId, status: "Pending" })
    .then((dataOfInvoices) => {
      if (dataOfInvoices.data.length === 0) {
        return
      }
      const last_time_updated = moment().toISOString();
      const erect_percent = Number((Number(payload?.percentage_complete) * 0.7).toFixed(2));
      const dismantle_percent = Number((Number(payload?.percentage_complete) * 0.3).toFixed(2));
      const invoiced = Number((Number(dataOfInvoices?.data[0]?.ed_total) * (payload?.percentage_complete / 100)).toFixed(2));

      const balance = invoiced - dataOfInvoices?.data[0]?.last_invoice;
      supabase.from("edinvoices").update({
        PO_Number: payload?.PO_Number,
        zone: payload?.zone, zone_label: payload?.zone_label, type: payload?.type, description: payload?.description,
        erect_percent, dismantle_percent, complete_percent: payload?.percentage_complete,
        last_time_updated, invoiced, balance
      }).match({ id: dataOfInvoices.data[0].id }).then((dataNewInvoice) => console.log(dataNewInvoice));

    });

  supabase.from("weekly_hire_invoices").update({
    type: payload?.type, zone_label: payload?.zone_label, zone: payload?.zone,
    description: payload?.description, completed: payload?.percentage_complete
  }).match({ task_id: taskId, status: "Pending" }).then((dataInvoice) => { console.log(dataInvoice) });

  checkJobStatus(data[0].job_id);

  if (error) {
    throw new Error(error.messge);
  }

  try {
    await updateAppenateTask(data)
  } catch (err) {
    console.log("Error updating task")
  }

  return data;
}

export function useUpdateTask() {
  const { addNotification } = useNotificationStore();

  const queryClient = useQueryClient();
  let refreshType = "";

  return useMutation(
    ({ payload, taskId, type = "tasks" }) => {
      refreshType = type;
      return updateTask({ payload, taskId });
    },
    {
      onSuccess: () => {
        console.log({ refreshType });
        queryClient.refetchQueries(refreshType);
        queryClient.refetchQueries("day_work_task");
        addNotification({
          isSuccess: true,
          heading: "Success!",
          content: `Successfully updated task.`,
        });
      },
      onError: (err) => {
        addNotification({
          isSuccess: false,
          heading: "Failed update task",
          content: err?.message,
        });
      },
      mutationFn: updateTask,
    },
  );
}

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