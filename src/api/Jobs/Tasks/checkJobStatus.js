import supabase from "../../supabase";

export async function checkJobStatus(job_id) {
    const { data, error } = await supabase
        .from("job_tasks")
        .select("*")
        .match({ job_id });

    console.log(`Task For this job: ${data.length}`);
    const tasksCompleted = data.filter(row => row.percentage_complete === 100);

    console.log(`Task For this job Completed: ${tasksCompleted.length}`);

    if (data.length === tasksCompleted.length) {
        await supabase
            .from("jobs")
            .update({ "job_status": "Completed", "on_hire": "No" })
            .match({ id: job_id }).then((data) => console.log(data))
    }
}