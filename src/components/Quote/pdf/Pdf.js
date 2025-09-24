import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";

import { Quote } from "./Quote";
import { fetchQuote } from "../../../api/Quotes";

import { Spinner } from "../../../common";

import { Output } from "./Output";

import { useQuoteStore } from "./store";

export function QuotePdf() {
  const [quote, setQuote] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { quoteId } = useParams(0);

  const { addQuote, setLoading } = useQuoteStore();

  useEffect(async () => {
    if (quoteId) {
      const quoteData = await fetchQuote(quoteId);

      let totalLabourTransport = 0;
      let WeeklyHireFees = 0;
      for (const row of quoteData.quote_lines) {
        totalLabourTransport += Number(row.erect_dismantle || 0) * (row.quantity || 1)
        totalLabourTransport += Number(row.transport || 0) *  (row.quantity || 1)
        WeeklyHireFees += Number(row.weekly_fee || 0) *  (row.weekly_duration || 1) *(row.quantity || 1)
      }
      if (quoteData?.quote_addons?.length) {
        for (const row of quoteData.quote_addons) {
          totalLabourTransport += Number(row.fixed_charge || 0) * (row.duration || 1)
          WeeklyHireFees += Number(row.hire_fee || 0) * (row.duration || 1)
        }
      }

      quoteData.summaryCosts = [
        {
          id: 1,
          "summaryConcept": "Total Labour including Transport",
          "summaryTotalCost": totalLabourTransport
        },
        {
          "id": 2,
          "summaryConcept": "Weekly Hire Fees",
          "summaryTotalCost": WeeklyHireFees
        }
      ]

      // setQuote(quoteData);
      setIsLoading(false);

      addQuote(quoteData);
      setLoading(false);
    }
  }, [quoteId]);

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Output quote={quote} />
    </div>
  );
  // return (
  //   <div>
  //     <PDFViewer width="100%" height="1000">
  //       <Quote
  //         quote={quote}
  //         invoice={quote?.quote_lines}
  //         zoneData={quote?.quote_lines}
  //         additionalData={quote?.quote_addons}
  //       />
  //     </PDFViewer>
  //   </div>
  // );
}

// import React, { useState, useEffect } from "react";
// import { PDFViewer } from "@react-pdf/renderer";
// import { useParams } from "react-router-dom";

// import { Quote } from "./Quote";
// import { fetchQuote, useFetchQuote } from "../../../api/Quotes";

// import { Spinner } from "../../../common";

// export function QuotePdf() {
//   const [quote, setQuote] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { quoteId } = useParams(0);

//   const quoteQuery = useFetchQuote(quoteId);

//   if (quoteQuery.isLoading) {
//     return (
//       <div className="w-full h-48 flex justify-center items-center">
//         <Spinner size="lg" />
//       </div>
//     );
//   }

//   if (!quoteQuery.data) return null;
//
//   return (
//     <>
//       <PDFViewer width="100%" height="1000">
//         <Quote
//           quote={quoteQuery.data}
//           invoice={quoteQuery.data?.quote_lines}
//           zoneData={quoteQuery.data?.quote_lines}
//           additionalData={quoteQuery.data?.quote_addons}
//         />
//       </PDFViewer>
//     </>
//   );
// }
