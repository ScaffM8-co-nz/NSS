import React, { useState, useEffect } from "react";
import styled from "styled-components";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import { PencilAltIcon, DocumentTextIcon } from "@heroicons/react/solid";

import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { Container } from "../../utils";

import { PageHeading, Badge } from "../../common";
import { TimesheetsApi } from "../../api";

export const ApprovedTimesheetMain = () => {
  const timesheetsQuery = TimesheetsApi.useTimesheets("Approved");
  const exportTimesheets = TimesheetsApi.useUpdateTimesheetExport();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [filters, setFilters] = useState(null);
  const [globalFilterValue1, setGlobalFilterValue] = useState("");

  const dt = React.useRef(null);

  useEffect(() => {
    initFilters();
  }, []);

  const formatDate = (value) =>
    value.toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const clearFilter = () => {
    initFilters();
  };

  const exportCSV = async (selectionOnly) => {
    console.log("selectionOnly", dt.current);
    dt.current.exportCSV({ selectionOnly });

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
  };

  const onGlobalFilterChange = (e) => {
    const { value } = e.target;
    const _filters = { ...filters };
    _filters.global.value = value;
    _filters.exported.value = null;
    console.log("FILTERS", _filters);

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
      exported: { value: "No", matchMode: FilterMatchMode.EQUALS },
    });
    setGlobalFilterValue("");
  };

  const renderHeader = () => (
    <div className="-mb-12 -mt-10">
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
          className="p-button-outlined p-mr-2"
          data-pr-tooltip="CSV"
        />
      </div>
    </div>
  );

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
    <td key={`${data?.staff?.staff_name}_headerLabel`} colSpan="8">
      <span className="text-gray-900 font-bold">{data?.staff?.staff_name || ""}</span>
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
          // const hours = timesheet.time_off
          //   ? Number(calcHours(timesheet.time_on, timesheet.time_off))
          //   : 0;
          const hours = timesheet.time_off ? Number(timesheet.hours) : 0;
          total += hours;
        }
      }
    }
    return total;
  };

  const footerTemplate = (data) => (
    <>
      <td
        key={`${data?.staff?.staff_name}_footerTotalLabel`}
        colSpan="8"
        style={{ textAlign: "right" }}
        className="bg-gray-100 font-normal"
      >
        Total Hours
      </td>
      <td
        key={`${data?.staff?.staff_name}_footerTotalValue`}
        colSpan="4"
        className="bg-gray-100 font-semibold"
      >
        {calculateTimesheetTotal(data)}
      </td>
    </>
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
  return (
    <div>
      <PageHeading title="Approved Timesheets" isEditable={false} setOpen={setOpen} />
      <Container>
        <h3 className="px-4 pb-2 text-md leading-5">
          Use the selection menu to select timesheets to export. Once exported, These timesheets
          will be filtered out of the timesheet table below.
        </h3>
        <div className="mx-auto mt-8">
          <DataTable
            ref={dt}
            value={timesheetsQuery.data}
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
            globalFilterFields={["staff.staff_name", "comments", "status", "approved_by"]}
            header={renderHeader()}
            emptyMessage="All timesheets have been exported."
            rowGroupMode="subheader"
            groupRowsBy="staff.id"
            rowGroupHeaderTemplate={headerTemplate}
            // rowGroupFooterTemplate={footerTemplate}
            selection={selectedTimesheets}
            onSelectionChange={(e) => setSelectedTimesheets(e.value)}
            // scrollHeight="600px"
          >
            <Column
              className="bg-gray-300"
              selectionMode="multiple"
              headerStyle={{ width: "2rem" }}
            />
            <Column
              header="Date"
              field={(row) => moment(row.date).format("DD/MM/YYYY")}
              body={dateBodyTemplate}
              filterField="date"
              dataType="date"
              style={{ minWidth: "6rem" }}
              filter
              filterElement={dateFilterTemplate}
            />
            <Column header="Staff" field="staff.staff_name" />
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
              field="hours"
              header="Total Hours"
              body={(row) => {
                const start = moment(row.time_on, "HH:mm");
                const finish = moment(row.time_off, "HH:mm");

                if (row.time_off && finish) {
                  const duration = moment.duration(finish.diff(start));
                  const hours = duration.asHours();
                  return <span>{hours.toFixed(2)}</span>;
                }
                return <span />;
              }}
              showFilterMatchModes={false}
              style={{ minWidth: "4rem" }}
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
              style={{ width: "8rem", textAlign: "center" }}
              body={(row) => <Badge type={row.status} text={row.status} />}
            />
            <Column
              field="approved_by"
              header="Approved By"
              bodyClassName="p-text-center"
              style={{ minWidth: "4rem" }}
            />
            <Column
              field="exported"
              header="Exported"
              filter
              filterElement={statusFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
              exportable={false}
            />
          </DataTable>
        </div>
      </Container>
    </div>
  );
};
