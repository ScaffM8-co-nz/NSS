import { useMutation } from "react-query";
import supabase from "../supabase";

export async function createEntry(user) {
  const { data, error } = await supabase.from("user_history").insert(user);
    
  if (error) {
    throw new Error(error.messge);
  }
  return data;
}

export const useCreateEntry = () =>
  useMutation((user) => createEntry(user), {
    onSuccess: (data) => data,
    onError: (error) => error,
    mutationFn: useCreateEntry,
  });
