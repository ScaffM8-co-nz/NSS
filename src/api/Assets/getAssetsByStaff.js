import { useQuery } from "react-query";
import supabase from "../supabase";

async function fetchAssetsByStaff(staff) {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .match({ assigned_to: staff })
    .order("id", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return formatPayloadDates(data);
}

export function useAssetsByStaff(staff) {
  return useQuery("assets", () => fetchAssetsByStaff(staff));
}

function formatPayloadDates(data) {
  return [...(data || [])].map((d) => {
    d.last_inspected = d.last_inspected ? convertDate(d.last_inspected) : null;
    d.next_inspection = d.next_inspection ? convertDate(d.next_inspection) : null;
    d.asset_expiry = d.asset_expiry ? convertDate(d.asset_expiry) : null;
    return d;
  });
}

function convertDate(date) {
  const dateParts = date.split("/");
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}
