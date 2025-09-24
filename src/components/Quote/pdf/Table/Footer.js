import React from "react";
import { Text, Font, View, StyleSheet } from "@react-pdf/renderer";
import { numberFormat } from "../../../../utils";

const borderColor = "#E5E7EB";

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
    flexDirection: "row",
    alignItems: "center",
    height: 13,
    fontFamily: "Open Sans",
    fontSize: 8,
    fontWeight: "semibold",
    color: "#1F2937",
  },
  description: {
    width: "23%",
    textAlign: "right",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingRight: "2",
  },
  erectTotal: {
    width: "18%",
    textAlign: "right",
    paddingRight: "2",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  quantity: {
    width: "8%",
    textAlign: "left",
    paddingLeft: 8,
    fontFamily: "Open Sans",
    fontWeight: "bold",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  transportTotal: {
    width: "14%",
    textAlign: "right",
    paddingRight: "2",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  duration: {
    width: "11%",
    textAlign: "left",
    paddingLeft: 8,
    fontFamily: "Open Sans",
    fontWeight: "bold",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  weeklyTotal: {
    width: "12%",
    textAlign: "right",
    paddingRight: "2",
    fontFamily: "Open Sans",
    fontWeight: "bold",
    borderRightColor: borderColor,
    borderRightWidth: 1,
  },
  total: {
    width: "14%",
    textAlign: "right",
    paddingRight: "2",
    fontFamily: "Open Sans",
    fontWeight: "bold",
  },
});

export const Footer = ({ items }) => {
  // Calculate totals
  const erect = items
    .map(
      (item) => Number(item.erect_dismantle) * (item.quantity == null ? 1 : Number(item.quantity)),
    )
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const transport = items
    .map((item) => Number(item.transport) * (item.quantity == null ? 1 : Number(item.quantity)))
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const weekFee = items
    .map(
      (item) =>
        Number(item.weekly_fee) *
        Number(item.weekly_duration) *
        (item.quantity == null ? 1 : Number(item.quantity)),
    )
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const total = items
    .map((item) => Number(item.total))
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return (
    <View style={styles.row}>
      <Text style={styles.description}>Total</Text>
      <Text style={styles.quantity} />
      <Text style={styles.erectTotal}>{numberFormat.format(erect)}</Text>
      <Text style={styles.transportTotal}>{numberFormat.format(transport)}</Text>
      <Text style={styles.duration} />
      <Text style={styles.weeklyTotal}>{numberFormat.format(weekFee)}</Text>
      <Text style={styles.total}>{numberFormat.format(total)}</Text>
    </View>
  );
};
