import { useQuery } from "react-query";
import supabase from "../supabase";

export async function fetchFile(id) {
  const { data, error } = await supabase.from("files").select(`*`).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  return data[0];
}

export function useFetchFile(fileId) {
  return useQuery({
    queryKey: ["file", fileId],
    queryFn: () => fetchFile(fileId),
  });
}
