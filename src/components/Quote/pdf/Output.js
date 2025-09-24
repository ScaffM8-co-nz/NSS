import React, { useState, useEffect } from "react";

import {
  PDFViewer,
  Document,
  Page,
  Image,
  View,
  Text,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

import logo from "../../../logo.png";
import footer from "../../../footer.png";

import { useQuoteStore } from "./store";

import { Spinner } from "../../../common";

import { Table } from "./Table/Table";
import { Description } from "./Description";
import { Terms } from "./Terms";

import { quoteColumns, summaryCostColumns, additionalItemsColumns } from "./columns";
import { Heading, ClientInfo } from "./Heading";

export function Output() {
  const [numPages, setNumPages] = useState(null);

  const { isLoading, quote } = useQuoteStore();

  if (isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PDFViewer width="100%" height="1000">
        <Document>
          <Page size="A4" style={styles.page}>
            <Heading quote={quote} />
            <ClientInfo quote={quote} />
            <Description description={quote.description} />
            <Text style={styles.heading}>Zones</Text>
            <Table invoice={quote.quote_lines} columns={quoteColumns} groupable />

            {quote?.quote_addons.length ? (
              <View>
                <Text style={styles.heading}>Additional Items</Text>
                <Table
                  type="Additional"
                  invoice={quote.quote_addons}
                  columns={additionalItemsColumns}
                />
              </View>
            ) : null}
            <Text style={styles.heading}>Summary of Costs</Text>
            <Table type="Summary" invoice={quote.summaryCosts} columns={summaryCostColumns} />
            
            <Text style={styles.subTextBoldRed}>
              All prices exclude GST
            </Text>
            
            <View wrap={false}>
              <Terms terms={quote.terms} />
            </View>

            <View style={styles.footer} fixed>
              <Image style={styles.footerLogo} src={footer} fixed />
              <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                fixed
              />
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    // paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
    flexDirection: "column",
  },
  heading: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    width: 150,
    alignItems: "left",
    fontFamily: "Open Sans",
    fontWeight: "semibold",
    fontSize: 9,
    color: "#1A8140",
    marginTop: 8,
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headingContact: {
    textAlign: "right",
    marginTop: 20,
  },
  headingDisplay: {
    display: "flex",
    flexDirection: "row",
  },
  headingText: {
    fontFamily: "Open Sans",
    fontWeight: "semibold",
    fontSize: 7,
  },
  subText: {
    fontFamily: "Open Sans",
    marginLeft: 4,
    fontSize: 7,
    // fontWeight: "semibold",
  },
  subTextBoldRed: {
    fontFamily: "Open Sans",
    color: "red",
    marginLeft: 4,
    marginTop: 15,
    fontSize: 7,
    fontWeight: "bold",
    textAlign:"right"
  },
  logo: {
    objectFit: "contain",
    width: "20%",
    height: "auto",
    paddingTop: 20,
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    right: 0,
  },

  footerLogo: {
    objectFit: "contain",
    width: "110%",
    // height: "auto",
    marginRight: 0,
  },

  footerText: {
    fontSize: 6,
    paddingLeft: 10,
  },

  pageNumber: {
    // position: "absolute",
    marginTop: 10,
    marginRight: 17,
    // paddingLeft: 70,
    fontSize: 8,
    // bottom: 30,
    // left: 0,
    // right: 0,
    textAlign: "center",
    color: "grey",
  },
});
