import React, { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import { PencilAltIcon, DuplicateIcon, CheckIcon, XIcon } from "@heroicons/react/solid";

import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Container, numberFormat } from "../../utils";
import "react-datepicker/dist/react-datepicker.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";
import { PageHeading, Button as CustomButton } from "../../common";
import { WeeklyHireApi } from "../../api";

export const WeeklyHireMain = () => {
  const hireQuery = WeeklyHireApi.useHiresApproved();

  const [filters, setFilters] = useState(null);
  const [globalFilterValue1, setGlobalFilterValue] = useState("");

  const dt = React.useRef(null);
  useEffect(() => {
    initFilters();
  }, []);

  const formatDate = (value) =>
    value?.toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) ?? "";

  const clearFilter = () => {
    initFilters();
  };

  const exportCSV = (selectionOnly) => {
    dt.current.exportCSV({ selectionOnly });
  };

  const onGlobalFilterChange = (e) => {
    const { value } = e.target;
    const _filters = { ...filters };
    _filters.global.value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      completed_date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      date_on_hire: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      on_hire: { value: null, matchMode: FilterMatchMode.EQUALS },
      // status: { value: "Active", matchMode: FilterMatchMode.EQUALS },
    });
    setGlobalFilterValue("");
  };

  const renderHeader = () => (
    <div className="-mb-12 -mt-8">
      <div className="flex items-center">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear Filters"
          className="p-button-outlined"
          onClick={clearFilter}
        />
        <span className="p-input-icon-left ml-2">
          <InputText
            value={globalFilterValue1}
            onChange={onGlobalFilterChange}
            placeholder="Search Invoices"
          />
        </span>
      </div>
      <div className="mt-4">
        <Button
          type="button"
          icon="pi pi-file"
          label="Export"
          onClick={() => exportCSV(false)}
          className="p-mr-2 p-button-outlined"
          data-pr-tooltip="CSV"
        />
      </div>
    </div>
  );

  const dateBodyTemplate = (rowData, field) => formatDate(rowData[field]);

  const dateFilterTemplate = (options) => (
    <Calendar
      value={options.value}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      dateFormat="dd/mm/yy"
      placeholder="dd/mm/yyyy"
      mask="99/99/9999"
    />
  );

  const statusFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={["Yes", "No"]}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select a Status"
      className="p-column-filter"
      showClear
    />
  );

  const headerTemplate = (data) => (
    <td className="" colSpan="6">
      <span className="text-gray-900 font-bold">{data.job_display}</span>
    </td>
  );

  return (
    <div>
      <PageHeading title="Weekly Hire Invoices" isEditable={false} />
      <Container>
        <div className="mx-auto mt-8">
          <DataTable
            ref={dt}
            value={hireQuery.data}
            loading={hireQuery.isLoading}
            header={renderHeader()}
            paginator
            paginatorPosition="top|bottom|both"
            showGridlines
            rows={100}
            rowsPerPageOptions={[25, 50, 100]}
            dataKey="id"
            filters={filters}
            rowGroupMode="subheader"
            groupRowsBy="job_id"
            rowGroupHeaderTemplate={headerTemplate}
            filterDisplay="menu"
            // responsiveLayout="scroll"
            globalFilterFields={["job_display", "zone", "zone_label", "type", "description"]}
            emptyMessage="No Approved weekly hire invoices found."
            // scrollHeight="600px"
          >
            <Column
              header="Zone"
              field="zone"
              style={{ width: "5rem" }}
            />
            <Column
              header="Zone Label"
              field="zone_label"
              style={{ width: "6rem" }}
            />
            <Column header="Type" field="type" />
            <Column
              header="Description"
              field="description"
              style={{ minWidth: "8rem", maxWidth: "15rem" }}
            />
            <Column
              header="On Hire"
              field="on_hire"
              filter
              filterElement={statusFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
            />
            <Column
              header="% Complete"
              field="completed"
              style={{ width: "6rem" }}
            />
            <Column
              header="Date On Hire"
              field="date_on_hire"
              body={(data) => dateBodyTemplate(data, "date_on_hire")}
              filterField="date_on_hire"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
            />
            <Column
              header="Completed"
              field="completed_date"
              body={(data) => dateBodyTemplate(data, "completed_date")}
              filterField="completed_date"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
            />
            <Column
              header="Days On Hire"
              // field="days_on_hire"
              body={(row) => {
                if (row.date_on_hire) {
                  const days = calcDaysBetween(row.completed_date, row.date_on_hire);
                  return <span>{days}</span>;
                }
                if (row.completed_date) {
                  return row.days_on_hire;
                }
                return <></>;
              }}
              style={{ width: "6rem" }}
            />
            <Column
              header="Weekly Hire Rate"
              field="weekly_hire_rate"
              body={(row) => numberFormat.format(row.weekly_hire_rate)}
            />
            <Column
              header="Total"
              field="total"
              body={(row) => {
                // If row total has already been calculated, use that value, otherwise calculate total.
                if (row.completed_date && row.total) {
                  return numberFormat.format(row.total);
                }
                if (row.date_on_hire && row.weekly_hire_rate && row.completed) {
                  /**
                   * Days left on hire:
                   * If a completed date has been set, use that date as the days diff between date on hire and completed
                   * Otherwise, get remaining days till end of month.
                   */
                  const daysOnHire = calcDaysBetween(row.completed_date, row.date_on_hire);
                  const totalCalc = calculateInvoiceTotal(
                    daysOnHire,
                    row.weekly_hire_rate,
                    row.completed,
                  );
                  return <span>{numberFormat.format(totalCalc)}</span>;
                }
                return <></>;
              }}
              bodyStyle={{ textAlign: "center", fontWeight: "600" }}
            />
            <Column
              header="Invoice Number"
              style={{ width: "4rem" }}
              field="xeroReference"
              bodyStyle={{ textAlign: "center" }}
            />
          </DataTable>
        </div>
      </Container>
    </div>
  );
};

function calcDaysBetween(completedDate, dateOnHire) {
  const daysLeftInMonth = completedDate ? moment(completedDate, "DD/MM/YYYY") : moment();
  const hiredDate = moment(dateOnHire, "DD/MM/YYYY");
  return daysLeftInMonth.diff(hiredDate, "days");
}

function calculateInvoiceTotal(daysOnHire, hireRate, percentComplete) {
  /** ************
    Total Calculation:
    (Days_On_Hire * Daily_Fee) * (Percent_Complete / 100) >>>>> (13 * 100) * (50 / 100)

    Days_On_Hire = Days left in current month (From Date on Hire)
    Daily_Fee = “Weekly Hire Rate” / 7
    Percent_Complete = “% Complete”

  ************* */
  console.log("hireRate", hireRate);
  const dailyFee = (Number(hireRate) / 7).toFixed(2);
  const percent = Number(percentComplete);

  const totalCalc = daysOnHire * dailyFee * (percent / 100);
  console.log("CALC", daysOnHire, dailyFee, percent)
  return totalCalc.toFixed(2);
}
