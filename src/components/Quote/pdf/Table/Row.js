import React, { Fragment } from "react";

import { Text, View, Font, StyleSheet } from "@react-pdf/renderer";
import { RowGroup } from "./Group";

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
    fontSize: 7.4,
  },
  description: {
    textWrap: "nowrap",
    textOverflow: "ellipsis",
    flexDirection: "column",
    width: "25%",
    textAlign: "left",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingLeft: 8,
    paddingRight: 3,
  },
  quantity: {
    width: "10%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "center",
    paddingLeft: 8,
    paddingRight: 3,
  },
  erect: {
    width: "18%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "right",
    paddingRight: 8,
  },
  type: {
    width: "15%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "right",
    paddingRight: 8,
  },
  rate: {
    width: "12%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "left",
    paddingLeft: 8,
    paddingRight: 3,
  },
  duration: {
    width: "9%",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    textAlign: "center",
  },
  weekly: {
    width: "16%",
    textAlign: "right",
    borderRightColor: borderColor,
    borderRightWidth: 1,
    paddingRight: 8,
  },
  total: {
    width: "15%",
    textAlign: "right",
    paddingRight: 8,
  },
});
const sortByPosition = function sort(obj1, obj2) {
  return obj1.zone - obj2.zone;
};

export const Row = ({ items, groupable = false }) => {
  const groupBy = function group(data, key) { 
    return data.reduce((storage, item)=> {
      const group = item[key];
      storage[group] = storage[group] || [];
      storage[group].push(item);
      return storage; 
    }, {}); 
  }
  
  const grouped = groupBy(items, "zone_label");
  
  const sortedJson = Object.keys(grouped)
  .sort((a, b) => grouped[a][0].zone - grouped[b][0].zone)
  .reduce((accu, val) => {
    accu[`${val}`] = grouped[val];
    return accu;
  }, {});


  let rows;
  if (groupable) {
    rows = Object.entries(sortedJson).map((item) => (
      <>
        <RowGroup text={item[0]} />
        {item[1].map((row) => (
          <>
            <View style={styles.row}>
              <Text style={styles.description}>{row.description}</Text>
              <Text style={styles.quantity}>{row.quantity == null ? 1 : row.quantity}</Text>
              <Text style={styles.erect}>{`${numberFormat.format(
                Number(row.erect_dismantle),
              )}`}</Text>
              <Text style={styles.type}>{numberFormat.format(Number(row.transport))}</Text>
              <Text style={styles.duration}>{row.weekly_duration}</Text>
              <Text style={styles.weekly}>{`${numberFormat.format(Number(row.weekly_fee))}`}</Text>
              <Text style={styles.total}>{`${numberFormat.format(Number(row.total))}`}</Text>
            </View>
          </>
        ))}
      </>
    ));
  } else {
    rows = items.map((item) => (
      <View style={styles.row}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <Text style={styles.erect}>{item.erect_dismantle}</Text>
        <Text style={styles.duration}>{item.weekly_duration}</Text>
        <Text style={styles.duration}>{item.weekly_fee}</Text>
        <Text style={styles.amount}>{item.total}</Text>
      </View>
    ));
  }

  return <>{rows}</>;
};

/*
  zone_label (Grouping)

  description
  type
  erect_dismantle
  weekly_duration
*/
