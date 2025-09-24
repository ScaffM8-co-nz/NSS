import { useMutation, useQueryClient } from "react-query";
import supabase from "../../supabase";

import { formatQuoteLines, formatZones, formatAddons, formatRates } from "../../../utils";

import { createLines, createAddons, createZones, createRates } from "../index";
import { useNotificationStore } from "../../../store/notifications";

import { getQuoteNum } from "../read/getQuoteNum";

export async function clone(quote) {
  const lastQuote = await getQuoteNum();
  const lastQuoteNum = lastQuote?.quote_num?.split("-")?.[0];
  const nextNumSeq = lastQuoteNum ? Number(lastQuoteNum) + 1 : 1000;

  const { data, error } = await supabase.from("quotes").insert({
    quote_num: `${String(nextNumSeq)}-1`,
    version: 1,
    client: quote.client || null,
    contact_id: quote.contact_id || null,
    estimator: quote.estimator,
    created_by: quote.created_by,
    max_zones: quote.max_zones,
    description: quote.description,
    street_1: quote.street_1 || null,
    street_2: quote.street_2 || null,
    city: quote.city || null,
    post_code: quote.post_code || null,
    terms: quote.terms,
    weekly_total: quote.weekly_total,
    total_amount: quote.total_amount,
    status: "Pending",
  });

  if (error) {
    throw new Error(error.message);
  }
  const payload = { ...data, oldQuote: quote };
  return payload;
}

export function useClone() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation((quote) => clone(quote), {
    onSuccess: async (payload) => {
      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: "Successfully duplicated quote!",
      });
      if (payload.oldQuote.quote_lines.length) {
        const formattedLines = formatQuoteLines(payload.oldQuote.quote_lines, payload?.[0].id);
        await createLines(formattedLines);
      }
      if (payload.oldQuote.quote_addons.length) {
        const formattedLines = formatAddons(payload.oldQuote.quote_addons, payload?.[0].id);
        await createAddons(formattedLines);
      }
      if (payload.oldQuote.quote_zones.length) {
        const formattedLines = formatZones(payload.oldQuote.quote_zones, payload?.[0].id);
        await createZones(formattedLines);
      }
      if (payload.oldQuote.quote_rates.length) {
        const formattedLines = formatRates(payload.oldQuote.quote_rates, payload?.[0].id);
        await createRates(formattedLines);
      }
      addNotification({
        isSuccess: true,
        heading: "Success!",
        content: "Successfully duplicated quote!",
      });
      queryClient.refetchQueries("quotes");
    },
    onError: (err) => {
      addNotification({
        isSuccess: false,
        heading: "Failure!",
        content: "Failed to duplicate quote. Please try again.",
      });
    },
    mutationFn: clone,
  });
}
