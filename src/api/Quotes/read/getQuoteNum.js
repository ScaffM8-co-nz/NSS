import { useQuery } from "react-query";

import supabase from "../../supabase";

export async function getQuoteNum() {
  const { data, error } = await supabase
    .from("quotes")
    .select("id, quote_num")
    .order("quote_num", { ascending: false })
    .eq("version", 1)
    .limit(1)
    // .eq("version", 1);
    console.log(data)
  if (error) throw new Error(error.message);

  return data[0]

}
