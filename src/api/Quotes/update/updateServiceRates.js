import { useMutation } from "react-query";
import supabase from "../../supabase";
import { useNotificationStore } from "../../../store/notifications";

export async function updateAdminRates(rates) {
    const { data, error } = await supabase.from("service_rates").upsert(rates);

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const useUpdateAdminRates = () => {
    const { addNotification } = useNotificationStore();
    return useMutation((rates) => updateAdminRates(rates), {
        onSuccess: (data) => {
            addNotification({
                isSuccess: true,
                heading: "Success!",
                content: `Successfully Updating Rates.`,
            });
        },
        onError: (error) => error,
        mutationFn: updateAdminRates,
    });
}