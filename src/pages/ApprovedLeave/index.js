import React, { useState, useEffect } from "react";
import styled from "styled-components";
import clsx from "clsx";
// import moment from "moment";
import moment from "moment-business-days";
import { Link, useLocation } from "react-router-dom";
import { PencilAltIcon, FolderOpenIcon } from "@heroicons/react/solid";

import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { Container } from "../../utils";

import { PageHeading, Badge } from "../../common";
import { ApproveLeave, DeclineLeave } from "../../components/Leave";
import { LeaveApi } from "../../api";

export const LeaveApprovedMain = () => {
  const leaveQuery = LeaveApi.useLeaveWithOutStatus();
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
      start_date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      end_date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      // status: { value: "Approved", matchMode: FilterMatchMode.EQUALS },
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
          {/* <i className="pi pi-search" /> */}
          <InputText
            value={globalFilterValue1}
            onChange={onGlobalFilterChange}
            placeholder="Search Leave"
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

  const dateBodyTemplate = (rowData, field) => {
    console.log("ROW DAA", rowData, field);
    return formatDate(rowData[field]);
  };
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
      options={["Approved", "Declined"]}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select a Status"
      className="p-column-filter"
      showClear
    />
  );

  return (
    <div>
      <PageHeading title="Approved Leave" isEditable={false} setOpen={setOpen} />
      <Container>
        <div className="mx-auto mt-8">
          <DataTable
            ref={dt}
            value={leaveQuery.data}
            loading={leaveQuery.isLoading}
            header={renderHeader()}
            paginator
            paginatorPosition="top|bottom|both"
            showGridlines
            rows={25}
            rowsPerPageOptions={[25, 50, 100]}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            // stripedRows
            // responsiveLayout="scroll"
            globalFilterFields={["staff.staff_name", "type", "comments", "approved_by", "Approved"]}
            emptyMessage="No leave found."
            // scrollHeight="600px"
          >
            {/* <Column field="job_id" header="Job" /> */}
            <Column
              header="Date Added"
              field="created_at"
              // filterField="time_on"
              style={{ maxWidth: "6rem" }}
              body={(row) => moment(row.created_at).format("DD/MM/YYYY")}
            />
            <Column header="Staff" field="staff.staff_name" />
            <Column header="Leave Type" field="type" />
            <Column
              header="Start Date"
              field="start_date"
              filterField="start_date"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
              body={(row) => dateBodyTemplate(row, "start_date")}
            />
            <Column
              header="End Date"
              field="end_date"
              filterField="end_date"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
              body={(row) => dateBodyTemplate(row, "end_date")}
            />
            <Column header="Comments" field="comments" style={{ minWidth: "10rem" }} />
            <Column
              field="total_days"
              header="Total Leave Days"
              bodyClassName="p-text-center"
              style={{ width: "8rem", textAlign: "center" }}
              body={(row) => {
                const start = row.start_date;
                const end = row.end_date;
                const diff = moment(end).businessDiff(moment(start));
                console.log("DIFF >>> ", diff);

                return diff + 1;
              }}
            />
            <Column header="Approved/Declined by" field="approved_by" />
            <Column header="Status" field="status" />
          </DataTable>
        </div>
      </Container>
    </div>
  );
};
