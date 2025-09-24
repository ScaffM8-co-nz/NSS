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

import { Container } from "../../utils";

import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { PageHeading, Badge } from "../../common";
import { StaffApi } from "../../api";
import { StaffForm } from "../../components/Staff";

export const CompetencyMain = () => {
  const staffQuery = StaffApi.useStaff();
  const location = useLocation();
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState(null);
  const [globalFilterValue1, setGlobalFilterValue] = useState("");

  const dt = React.useRef(null);

  useEffect(() => {
    initFilters();
    StaffApi.fetchAllStaff().then((res) => {
      const transform = transformData(res);
      setCompetencies(transform);
      setLoading(false);
    });
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
      competency: { value: null, matchMode: FilterMatchMode.EQUALS },
      issue_date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      expiry_date: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
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
            placeholder="Search Competencies"
          />
        </span>
      </div>
    </div>
  );

  const dateBodyTemplate = (rowData, field) => {
    if (field === "issue_date" && rowData[field]) {
      return formatDate(rowData[field]);
    }
    if (rowData[field]) {
      const date = moment(rowData[field], "DD/MM/YYYY");
      const isNextWeek = date.diff(moment(), "days");
      return (
        <span
          className={clsx(
            isNextWeek <= 0 ? "text-red-500 font-semibold" : "",
            isNextWeek > 0 && isNextWeek < 30 ? "text-yellow-500 font-semibold" : "",
            "text-center",
          )}
        >
          {formatDate(rowData[field])}
        </span>
      );
    }
    return "";
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

    const competencyFilterTemplate = (options) => (
      <Dropdown
        value={options.value}
        options={[
          "Driver Licence",
          "Health & Safety Induction",
          "Building Construction Site Safe Passport",
          "First Aid Certificate",
          "Scaffolding Certificate of Competence",
        ]}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={(option) => option}
        placeholder="Select a Status"
        className="p-column-filter"
        showClear
      />
    );

  const headerTemplate = (data) => (
    <td key={`${data?.staff_name}_headerLabel`} colSpan="4">
      <Link
        key={`details${data.staff_id}`}
        to={`staff/${data.staff_id}/details`}
        className="flex items-center"
      >
        <FolderOpenIcon className="h-4 w-4 text-gray-500 mr-2" />
        <span className="text-gray-900 font-bold text-xs">{data?.staff_name || ""} (Details)</span>
      </Link>
    </td>
  );

  return (
    <div>
      <PageHeading title="Competencies" isEditable={false} setOpen={setOpen} />
      <Container>
        <div className="mx-auto mt-8">
          <DataTable
            ref={dt}
            value={competencies}
            loading={loading}
            header={renderHeader()}
            paginator
            paginatorPosition="top|bottom|both"
            showGridlines
            rows={500}
            rowsPerPageOptions={[100, 300, 500]}
            dataKey="id"
            filters={filters}
            filterDisplay="menu"
            rowGroupMode="subheader"
            groupRowsBy="staff_id"
            rowGroupHeaderTemplate={headerTemplate}
            // responsiveLayout="scroll"
            globalFilterFields={["staff_name", "competency"]}
            emptyMessage="No competencies found."
            // scrollHeight="600px"
          >
            <Column
              header="Competency"
              field="competency"
              style={{ minWidth: "10rem" }}
              filter
              filterElement={competencyFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
            />
            <Column
              header="Issue Date"
              field="issue_date"
              style={{ minWidth: "10rem" }}
              body={(row) => dateBodyTemplate(row, "issue_date")}
              filterField="issue_date"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
            />
            <Column
              header="Expiry Date"
              field="expiry_date"
              style={{ minWidth: "10rem" }}
              body={(row) => dateBodyTemplate(row, "expiry_date")}
              filterField="expiry_date"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
            />
            <Column header="Assessed By" field="assessed_by" style={{ minWidth: "10rem" }} />
          </DataTable>
        </div>
      </Container>
      <StaffForm heading="Create Staff" open={open} setOpen={setOpen} />
    </div>
  );
};

const lookup = {
  "Driver Licence": ["endorsement_complete_date", "endorsement_expiry", "licence_assessed_by"],
  "Health & Safety Induction": ["induction_date", "expiry_date", "hs_assessed_by"],
  "Building Construction Site Safe Passport": [
    "passport_issue",
    "passport_expiry",
    "site_safe_assessed_by",
  ],
  "First Aid Certificate": ["first_aid_issue", "first_aid_expiry", "firstaid_assessed_by"],
  "Scaffolding Certificate of Competence": [
    "cert_issue_date",
    "cert_expiry_date",
    "scaff_cert_assessed_by",
  ],
  "Height Training": [
    "height_training_issue",
    "height_training_expiry",
    "height_training_assessed_by",
  ],
};

function transformData(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    for (const [key, value] of Object.entries(lookup)) {
      const issueDate = data[i][value[0]];
      const expiryDate = data[i][value[1]];
      result.push({
        staff_id: data[i].id,
        staff_name: data[i]?.staff_name || "",
        competency: key,
        issue_date: issueDate ? convertDate(issueDate) : null,
        expiry_date: expiryDate ? convertDate(expiryDate) : null,
        assessed_by: data[i][value[2]] || "",
      });
    }
  }
  return result;
}

function convertDate(date) {
  const dateParts = date.split("/");
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}
