import React, { useState, useEffect } from "react";
import styled from "styled-components";
import clsx from "clsx";
import moment from "moment";
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
import { JobsApi } from "../../api";
import { CreateJob } from "../../components/Jobs";
import supabase from "../../api/supabase";

export { JobDetails } from "./Details";
export { EditJob } from "./Edit";

export const JobsMain = () => {
  const user = supabase.auth.user();
  const staffData = JobsApi.usefetchAllHandover();

  const jobQuery = JobsApi.useJobs();

  const location = useLocation();
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState(null);
  const [globalFilterValue1, setGlobalFilterValue] = useState("");

  const dt = React.useRef(null);
  useEffect(async () => {
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
    console.log(`the filters are ${JSON.stringify(filters)}`)
    const _filters = { ...filters };
    // _filters.global.value = value;
    _filters.global.value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);

    console.log(`the filters are ${JSON.stringify(_filters)}`)
    console.log(`the filters value is ${JSON.stringify(value)}`)
  };
  

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      type: { value: null, matchMode: FilterMatchMode.EQUALS },
      status: { value: "Active", matchMode: FilterMatchMode.EQUALS },
      job_status: { value: null, matchMode: FilterMatchMode.EQUALS },
      on_hire: { value: null, matchMode: FilterMatchMode.EQUALS },
      Supervisor: { value: null, matchMode: FilterMatchMode.EQUALS },
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
            placeholder="Search Jobs"
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

  const statusFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={["Active", "Inactive"]}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select a Status"
      className="p-column-filter"
      showClear
    />
  );

  const jobStatusDropdowns = [
    "Admin",
    "Install In Progress",
    "Install Complete",
    "Variation In Progress",
    "Variation Complete",
    "Dismantle In Progress",
    "Dismantle Complete",
    "Job Complete",
    "Admin Complete",
    "Pending Handover",
  ];

  const jobOnHireDropdowns = [
    "Yes",
    "No"
  ];

  const jobStatusFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={jobStatusDropdowns}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select a Status"
      className="p-column-filter"
      showClear
    />
  );

  const jobOnHireFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={jobOnHireDropdowns}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select"
      className="p-column-filter"
      showClear
    />
  );

  const jobSupervisorFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={ [...new Set(staffData.data ? staffData.data.map( (element) => element?.staff?.staff_name).filter((e) => e != null): [])] }
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select"
      className="p-column-filter"
      showClear
    />
  );

  const staffTypeFilterTemplate = (options) => (
    <Dropdown
      value={options.value}
      options={["Employee", "Scaffolder", "Office", "Foreman", "Truck Driver", "Application"]}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => option}
      placeholder="Select a Status"
      className="p-column-filter"
      showClear
    />
  );

  const showStaff = (job_id) => {
    console.log(job_id)

    const data = staffData?.data?.find(e => e?.job_id === job_id)
    if (!data)
      return ""
    
    return data?.staff?.staff_name

  }
  if (jobQuery.isLoading || staffData.isLoading) {
    return <br />
  } 
  for (let index = 0; index < jobQuery.data.length; index++) {
    jobQuery.data[index].Supervisor = showStaff(jobQuery.data[index].id) || ""
  }
  return ( 
  <div>
      <PageHeading title="Jobs" createBtn="Create Job" isEditable={false} setOpen={setOpen} />
      <Container>
        <div className="mx-auto mt-8">
          <DataTable
            ref={dt}
            value={jobQuery.data}
            loading={jobQuery.isLoading && staffData.isLoading}
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
            // scrollable = {false}
            // responsiveLayout="scroll"
            globalFilterFields={[
              "job_num",
              "clients.client_name",
              "site",
              "job_status",
              "on_hire",
              "status",
              "Supervisor"
            ]}
            emptyMessage="No jobs found."
            // scrollHeight="600px"
          >
            {/* <Column field="job_id" header="Job" /> */}
            <Column
              header="Job # (Details)"
              field="job_id"
              // filterField="time_on"
              style={{ maxWidth: "8rem", textAlign: "center" }}
              body={(row) => (
                <Link
                  key={`details${row.id}`}
                  to={`jobs/${row.id}/details`}
                  className="flex items-center"
                >
                  <FolderOpenIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="hover:text-gray-800">#{row.job_num}</span>
                </Link>
              )}
            />
            <Column header="Client" field="clients.client_name" />
            <Column header="Site Address" field="site" style={{ minWidth: "10rem" }} />
            <Column header="Supervisor" field="Supervisor"
              bodyClassName="p-text-center"
              filter
              filterElement={jobSupervisorFilterTemplate}
              filterMenuStyle={{ width: "14rem" }} 
              style={{ minWidth: "10rem" }}
            />
            <Column
              header="Start Date"
              field="start_date"
              style={{ minWidth: "10rem" }}
            // body={(row) => (row.start_date ? formatDate(row.start_date) : "")}
            />
            <Column header="End Date" field="end_date" style={{ minWidth: "10rem" }} />
            <Column
              field="job_status"
              header="Job Status"
              bodyClassName="p-text-center"
              style={{ width: "10rem" }}
              filter
              filterElement={jobStatusFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
            />
            <Column
              field="on_hire"
              header="On Hire"
              bodyClassName="p-text-center"
              style={{ width: "10rem" }}
              filter
              filterElement={jobOnHireFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
            />
            <Column
              field="branding"
              header="Brand"
              bodyClassName="p-text-center"
              style={{ width: "3rem" }}
            />
            <Column
              field="status"
              header="Status"
              bodyClassName="p-text-center"
              style={{ width: "10rem", textAlign: "center" }}
              body={(row) => <Badge type={row.status} text={row.status} />}
              filter
              filterElement={statusFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
            />

            <Column
              header="Edit"
              bodyClassName="p-text-center"
              style={{ width: "3rem" }}
              body={(row) => (
                <Link
                  to={{
                    pathname: `jobs/${row.id}/editJob`,
                    state: { background: location, name: "editJob" },
                  }}
                >
                  {
                    (user.email === "clifton@nss.co.nz") || (user.email === "shaun@nss.co.nz") || (user.email === "accounts@nss.co.nz") || (user.email === "keith@techenabled.nz") || (user.email === "samuel@soluntech.com") ?
                      <PencilAltIcon className="text-gray-600 h-4 w-4" />
                      : ''}
                </Link>
              )}
            />
          </DataTable>
        </div>
      </Container>
      <CreateJob open={open} setOpen={setOpen} />
    </div>
  );
};
