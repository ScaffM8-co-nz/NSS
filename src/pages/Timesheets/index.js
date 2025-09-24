import React, { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import { PencilAltIcon, DocumentTextIcon } from "@heroicons/react/solid";

import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

import { Container } from "../../utils";

import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { ApproveTimesheet } from "../../components/Timesheet/ApproveTimesheet";
import { PageHeading, Badge } from "../../common";
import { TimesheetsApi } from "../../api";
import ExportTimesheetTable from "../../components/Timesheet/ExportTimesheetTable";

export { Edit } from "./Edit";
export { TimesheetDetails } from "./Details";

export const TimesheetMain = () => {
  const timesheetsQuery = TimesheetsApi.useTimesheets("Pending");
  const exportTimesheets = TimesheetsApi.useUpdateTimesheetExport();
  const [timesheetData, setTimesheetData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const location = useLocation();
  const dt = React.useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedTimesheets, setSelectedTimesheets] = useState(null);
  const [filters, setFilters] = useState(null);
  const [globalFilterValue1, setGlobalFilterValue] = useState("");

  useEffect(() => {
    initFilters();
  }, []);

  useEffect(() => {
    const data = timesheetsQuery?.data?.map((item) => {
      const start = moment(item.time_on, "HH:mm");
      const finish = moment(item.time_off, "HH:mm");

      if (item.time_off && finish) {
        const duration = moment.duration(finish.diff(start));
        const hours = duration.asHours();
        item.total_hours = hours.toFixed(2);
      }
      return item;
    });
    setTimesheetData(data);
  }, [timesheetsQuery?.data]);

  const formatDate = (value) =>
    value.toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const clearFilter = () => {
    initFilters();
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
      date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    });
    setGlobalFilterValue("");
  };

  const renderHeader = () => (
    <div className="-mb-12">
      <div className="flex items-center">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear Filters"
          className="p-button-outlined"
          onClick={clearFilter}
        />
        <span className="p-input-icon-left ml-2">
          {/* <i className="pi pi-search" /> */}
          <InputText
            value={globalFilterValue1}
            onChange={onGlobalFilterChange}
            placeholder="Search Timesheets"
          />
        </span>
      </div>
      <div className="mt-4">
        <Button
          type="button"
          icon="pi pi-file"
          label="Export"
          onClick={() => {
            if (selectedTimesheets.length === 0) {
              alert("Select timesheets using the selection checkbox to export");
            } else {
              exportCSV(true);
            }
          }}
          loading={isExporting}
          className="p-button-outlined p-mr-2"
          data-pr-tooltip="CSV"
        />
      </div>
    </div>
  );
  const exportCSV = async (selectionOnly) => {
    setIsExporting(true)
    setTimeout(() => {
      dt.current.exportCSV({ selectionOnly });
      setIsExporting(false)
    }, 3000);
    const exportedTimesheets = selectedTimesheets.map((row) => ({
      id: row?.id,
      exported: "Yes",
    }));
    try {
      await exportTimesheets.mutateAsync({
        timesheets: exportedTimesheets,
      });
    } catch (err) {
      console.log("Failed to update export timesheets", err);
    }
    setIsLoading(false)
  };

  const dateBodyTemplate = (rowData) => formatDate(rowData.date);
  const dateFilterTemplate = (options) => (
    <Calendar
      value={options.value}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      dateFormat="dd/mm/yy"
      placeholder="dd/mm/yyyy"
      mask="99/99/9999"
    />
  );
  const headerTemplate = (data) => (
    <td className="" colSpan="8">
      <span className="text-gray-900 font-bold">{data.staff?.staff_name}</span>
    </td>
  );

  function calcHours(startTime, finishTime) {
    const start = moment(startTime, "HH:mm");
    const finish = moment(finishTime, "HH:mm");

    const duration = moment.duration(finish.diff(start));
    const hours = duration.asHours();
    return hours.toFixed(2);
  }

  const calculateTimesheetTotal = (data) => {
    let total = 0;

    if (timesheetsQuery.data) {
      for (const timesheet of timesheetsQuery.data) {
        if (Number(timesheet.staff_id) === data.staff_id) {
          // console.log("MATCHING ID", data.staff_id)
          const hours = timesheet.time_off
            ? Number(calcHours(timesheet.time_on, timesheet.time_off))
            : 0;
          total += hours;
          // total += Number(calcHours(data.time_on, data.time_off));
        }
      }
    }
    return total;
  };

  const footerTemplate = (data) => (
    <>
      <td colSpan="7" style={{ textAlign: "right" }} className="bg-gray-100 font-normal">
        Total Hours
      </td>
      <td colSpan="4" className="bg-gray-100 font-semibold">
        {calculateTimesheetTotal(data)}
      </td>
    </>
  );

  if (isLoading && isExporting) return null;
  return (
    <div>
      <PageHeading title="Timesheet" isEditable={false} setOpen={setOpen} />
      <Container>
        <div className="mx-auto mt-8">
          <div className="pl-3">
            <ApproveTimesheet timesheets={selectedTimesheets} />
          </div>
          <DataTable
            value={timesheetData}
            loading={timesheetsQuery.isLoading}
            paginator
            paginatorPosition="top|bottom|both"
            showGridlines
            rows={100}
            rowsPerPageOptions={[25, 50, 100]}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            // stripedRows
            // responsiveLayout="scroll"
            globalFilterFields={["staff.staff_name", "comments", "status"]}
            header={renderHeader()}
            emptyMessage="No timesheets found."
            rowGroupMode="subheader"
            groupRowsBy="staff.staff_name"
            rowGroupHeaderTemplate={headerTemplate}
            rowGroupFooterTemplate={footerTemplate}
            selection={selectedTimesheets}
            onSelectionChange={(e) => setSelectedTimesheets(e.value)}
            // scrollHeight="600px"
            selectionMode="checkbox"
            showSelectionElement={(row) => row.actual_start !== null && row.actual_finish !== null}
          >
            <Column
              className="bg-gray-300"
              selectionMode="multiple"
              headerStyle={{ width: "2rem" }}
            />
            <Column field="staff.staff_name" header="Staff" />

            <Column
              header="Details"
              bodyClassName="p-text-center"
              style={{ width: "3rem" }}
              body={(row) => (
                <Link
                  to={{
                    pathname: `timesheets/${row.id}/details`,
                  }}
                >
                  <DocumentTextIcon className="text-gray-600 h-4 w-4" />
                </Link>
              )}
            />

            <Column
              header="Date"
              filterField="date"
              field="date"
              dataType="date"
              style={{ minWidth: "10rem" }}
              filter
              filterElement={dateFilterTemplate}
              body={dateBodyTemplate}
            />
            <Column
              header="Actual Start"
              field="actual_start"
              filterField="time_on"
              style={{ minWidth: "10rem" }}
            />
            <Column
              header="Adjusted Start"
              field="time_on"
              filterField="time_on"
              style={{ minWidth: "10rem" }}
            />

            <Column
              field="actual_finish"
              header="Actual Finish"
              filterMenuStyle={{ width: "14rem" }}
              style={{ minWidth: "12rem" }}
            />
            <Column
              field="time_off"
              header="Adjusted Finish"
              filterMenuStyle={{ width: "14rem" }}
              style={{ minWidth: "12rem" }}
            />
            <Column
              // field="activity"
              header="Total Hours"
              showFilterMatchModes={false}
              style={{ minWidth: "4rem" }}
              field="total_hours"
            />
            <Column
              field="comments"
              header="Comments"
              bodyClassName="p-text-center"
              style={{ minWidth: "8rem" }}
            />
            <Column
              // field="status"
              header="Status"
              bodyClassName="p-text-center"
              style={{ width: "4rem" }}
              body={(row) => <Badge type={row.status} text={row.status} />}
            />
            <Column
              // field="status"
              header="Edit"
              bodyClassName="p-text-center"
              style={{ width: "3rem" }}
              body={(row) => (
                <Link
                  to={{
                    pathname: `timesheets/${row.id}/editTimesheet`,
                    state: { background: location, name: "editTimesheet" },
                  }}
                >
                  <PencilAltIcon className="text-gray-600 h-4 w-4" />
                </Link>
              )}
            />
          </DataTable>
        </div>
      </Container>

      <ExportTimesheetTable
        selectedTimesheets={selectedTimesheets}
        dt={dt}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
};

function convertDate(date) {
  const dateParts = date.split("/");

  // month is 0-based, that's why we need dataParts[1] - 1
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}
