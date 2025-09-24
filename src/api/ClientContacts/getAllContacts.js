import supabase from "../supabase";

export async function fetchAllContacts(id) {
  const { data, error } = await supabase
    .from("client_contacts")
    .select("*")
    .match({client_id:id});
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// export function useContacts() {
//   return useQuery("client_contacts", () => fetchAllContacts());
// }
