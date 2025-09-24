import React, { useState, useEffect } from "react";
import moment from "moment";
import { DuplicateIcon, CheckIcon, XIcon } from "@heroicons/react/solid";

import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

import DatePicker from "react-datepicker";
import { Container, numberFormat } from "../../utils";

import "react-datepicker/dist/react-datepicker.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { PageHeading, XeroStatus, Button as CustomButton } from "../../common";
import { ConfirmationDialog } from "../../common/Confirmation/Confirmation";
import { EndOfMonth, ApproveInvoices } from "../../components/WeeklyHire";
import { WeeklyHireApi } from "../../api";

export const WeeklyHireMain = () => {
  const hireQuery = WeeklyHireApi.useHiresPending();
  const updateHireMutation = WeeklyHireApi.useUpdateHire();
  const createHireMutation = WeeklyHireApi.useCreateHire();

  const [filters, setFilters] = useState(null);
  const [globalFilterValue1, setGlobalFilterValue] = useState("");
  const [invoicesSelected, setInvoicesSelected] = useState(null)

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
      on_hire: { value: "Yes", matchMode: FilterMatchMode.EQUALS },
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

  const textEditor = (options, type) => (
    <InputText
      type={type}
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
      style={{ minWidth: "3rem", maxWidth: "9rem" }}
    />
  );

  const calendarEditor = React.useCallback((options) => {
    const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
      <InputText type="text" value={value} onClick={onClick} ref={ref} style={{ width: "7rem" }} />
    ));
    return (
      <label htmlFor={options.field}>
        <DatePicker
          id={options.field}
          value={options.value}
          onChange={(val) => options.editorCallback(val)}
          selected={(options.value && moment(options.value, "DD/MM/YYYY").toDate()) || null}
          dateFormat="dd/MM/yyyy"
          placeholder="dd/mm/yyyy"
          className="w-16 text-xs border-gray-300 rounded-md shadow-sm"
          customInput={<ExampleCustomInput />}
        />
      </label>
    );
  }, []);
  const statusEditor = (options) => (
    <Dropdown
      value={options.value}
      options={[
        { label: "No", value: "No" },
        { label: "Yes", value: "Yes" },
      ]}
      optionLabel="label"
      optionValue="value"
      onChange={(e) => options.editorCallback(e.value)}
      placeholder="Select a Status"
      itemTemplate={(option) => <span>{option.label}</span>}
    />
  );

  const onEditComplete = async ({ newData }) => {
    console.log("DATA", newData);
    const hirePayload = {
      zone: newData.zone || "",
      zone_label: newData.zone_label || "",
      description: newData.description || "",
      on_hire: newData.on_hire || "",
      completed: Number(newData.completed) || 0,
      date_on_hire: newData.date_on_hire
        ? moment(newData.date_on_hire, "DD/MM/YYYY").format("DD/MM/YYYY")
        : "",
      completed_date: newData.completed_date
        ? moment(newData.completed_date, "DD/MM/YYYY").format("DD/MM/YYYY")
        : "",
      days_on_hire: newData.completed_date
        ? calcDaysBetween(newData.completed_date, newData.date_on_hire)
        : 0,
      total: newData.completed_date
        ? calculateInvoiceTotal(
          calcDaysBetween(newData.completed_date, newData.date_on_hire),
          newData.weekly_hire_rate,
          newData.completed,
        )
        : null,
    };
    try {
      const res = await updateHireMutation.mutateAsync({
        hire: hirePayload,
        hireId: newData.id,
      });
      console.log("UPDATE RES", res);
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <div>
      <PageHeading title="Weekly Hire Invoices" isEditable={false} />

      <br />

      <div className="px-6 flex items-center">
        <ApproveInvoices invoicesSelected={invoicesSelected} setInvoicesSelected={setInvoicesSelected} />
      </div>

      <br />
      
      <div className="px-6 flex items-center">
        <EndOfMonth invoicesSelected={invoicesSelected} />
      </div>

      <br />


      <XeroStatus />

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
            onRowEditComplete={onEditComplete}
            rowGroupMode="subheader"
            groupRowsBy="job_id"
            rowGroupHeaderTemplate={headerTemplate}
            filterDisplay="menu"
            editMode="row"
            // responsiveLayout="scroll"
            globalFilterFields={["job_display", "zone", "zone_label", "type", "description"]}
            emptyMessage="No weekly hire invoices found."
            // scrollHeight="600px"
            selectionMode="checkbox"
            selection={invoicesSelected}
            onSelectionChange={e => setInvoicesSelected(e.value)}
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
            <Column
              header="Zone"
              field="zone"
              editor={(options) => textEditor(options, "text")}
              style={{ width: "5rem" }}
            />
            <Column
              header="Zone Label"
              field="zone_label"
              editor={(options) => textEditor(options, "text")}
              style={{ width: "6rem" }}
            />
            <Column header="Type" field="type" />
            <Column
              header="Description"
              field="description"
              editor={(options) => textEditor(options, "text")}
              style={{ minWidth: "8rem", maxWidth: "15rem" }}
            />
            <Column
              header="On Hire"
              field="on_hire"
              editor={(options) => statusEditor(options)}
              filter
              filterElement={statusFilterTemplate}
              filterMenuStyle={{ width: "14rem" }}
            />
            <Column
              header="% Complete"
              field="completed"
              editor={(options) => textEditor(options, "number")}
              style={{ width: "6rem" }}
            />
            <Column
              header="Date On Hire"
              field="date_on_hire"
              editor={(options) => calendarEditor(options)}
              body={(data) => dateBodyTemplate(data, "date_on_hire")}
              filterField="date_on_hire"
              dataType="date"
              filter
              filterElement={dateFilterTemplate}
            />
            <Column
              header="Completed"
              field="completed_date"
              editor={(options) => calendarEditor(options)}
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
                  row.total = Number(totalCalc);
                  return <span>{numberFormat.format(totalCalc)}</span>;
                }
                return <></>;
              }}
              bodyStyle={{ textAlign: "center", fontWeight: "600" }}
            />
            <Column
              header="Handover Certificate"
              body={(row) => (
                <>
                  <a href={row.handover_url} target="_blank" rel="noreferrer">{row.handover_url ? "Link" : ""}</a>
                </>
              )}
              style={{ width: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              header="Duplicate"
              body={(row) => (
                <ConfirmationDialog
                  isDone={createHireMutation.isSuccess}
                  icon="info"
                  title="Duplicate Hire Invoice"
                  body="Duplicating this weekly hire invoice will create a copy of this record."
                  triggerButton={
                    <button type="button">
                      <DuplicateIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  }
                  confirmButton={
                    <CustomButton
                      isLoading={createHireMutation?.isLoading}
                      variant="primary"
                      onClick={async (e) => {
                        e.preventDefault();
                        const duplicatedInvoice = {
                          job_id: row.job_id || "",
                          zone: row.zone || "",
                          zone_label: row.zone_label || "",
                          type: row.type || "",
                          description: row.description || "",
                          on_hire: row.on_hire || "",
                          completed: row.completed || "",
                          // Start hire on the completed duplicate entry, otherwise use same date on hire.
                          date_on_hire: row.completed_date
                            ? moment(row.completed_date, "DD/MM/YYYY").format("DD/MM/YYYY")
                            : moment(row.date_on_hire, "DD/MM/YYYY").format("DD/MM/YYYY"),
                          weekly_hire_rate: row.weekly_hire_rate,
                        };
                        try {
                          await createHireMutation.mutateAsync(duplicatedInvoice);
                        } catch (err) {
                          console.log("ERROR DUPLICATING INVOICE", err);
                        }
                        // console.log("duplicatedInvoice", duplicatedInvoice);
                      }}
                    >
                      Duplicate Quote
                    </CustomButton>
                  }
                />
              )}
              style={{ width: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              header="Approve"
              body={(row) => (
                <ConfirmationDialog
                  isDone={updateHireMutation.isSuccess}
                  icon="CheckIcon"
                  title="Approve Hire Invoice"
                  body="Approve this weekly hire invoice."
                  triggerButton={
                    <button type="button">
                      <CheckIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  }
                  confirmButton={
                    <CustomButton
                      isLoading={updateHireMutation?.isLoading}
                      variant="primary"
                      onClick={async (e) => {
                        e.preventDefault();

                        try {
                          await updateHireMutation.mutateAsync({ hire: { status: "Approved" }, hireId: row.id });
                        } catch (err) {
                          console.log("ERROR Approving INVOICE", err);
                        }
                        // console.log("duplicatedInvoice", duplicatedInvoice);
                      }}
                    >
                      Approve Invoice
                    </CustomButton>
                  }
                />
              )}
              style={{ width: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              header="Delete"
              body={(row) => (
                <ConfirmationDialog
                  isDone={updateHireMutation.isSuccess}
                  icon="XIcon"
                  title="Delete Hire Invoice"
                  body="Approve this weekly hire invoice."
                  triggerButton={
                    <button type="button">
                      <XIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  }
                  confirmButton={
                    <CustomButton
                      isLoading={updateHireMutation?.isLoading}
                      variant="primary"
                      onClick={async (e) => {
                        e.preventDefault();

                        try {
                          await updateHireMutation.mutateAsync({ hire: { status: "Deleted" }, hireId: row.id });
                        } catch (err) {
                          console.log("ERROR Deleting INVOICE", err);
                        }
                        // console.log("duplicatedInvoice", duplicatedInvoice);
                      }}
                    >
                      Delete Invoice
                    </CustomButton>
                  }
                />
              )}
              style={{ width: "4rem" }}
              bodyStyle={{ textAlign: "center" }}
            />
            <Column
              rowEditor
              headerStyle={{ minWidth: "2.5rem" }}
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
