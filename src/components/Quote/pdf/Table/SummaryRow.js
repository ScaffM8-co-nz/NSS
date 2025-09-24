import React from "react";

import { Text, View, Font, StyleSheet } from "@react-pdf/renderer";
import { numberFormat } from "../../../../utils";

const borderColor = "#F3F4F6";

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 600,
    },
  ],
});

const styles = StyleSheet.create({
  row: {
    flexGrow: 1,
    flexDirection: "row",
    borderBottomColor: "#F3F4F6",
    borderBottomWidth: 1,
    fontFamily: "Open Sans",
    fontSize: 7,
  },
  type: {
    fontWeight: 600,
  },
  concept: {
    width: "100%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "left",
    paddingLeft: 8,
    paddingRight: 3,
  },
  totalCost: {
    width: "100%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "left",
    paddingLeft: 8,
    paddingRight: 3,
  }
});
// fixed_charge hire_fee total
export const SummaryRow = ({ items }) => (
  <View>
    {items.map(row => 
        <View style={styles.row}>
          <Text style={styles.concept}>{row.summaryConcept}</Text>
          <Text style={styles.totalCost}>{numberFormat.format(row.summaryTotalCost)}</Text>
        </View>
    )}
  </View>
);
