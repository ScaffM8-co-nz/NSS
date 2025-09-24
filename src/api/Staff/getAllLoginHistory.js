import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchLoginByEmail(email) {
  const { data, error } = await supabase.from("user_history").select(`*`).eq("email", email);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function usefetchLoginByEmail(email) {
  return useQuery({
    queryKey: ["Logins", email],
    queryFn: () => fetchLoginByEmail(email),
  });
}
