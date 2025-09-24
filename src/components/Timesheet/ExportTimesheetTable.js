import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PencilAltIcon, DocumentTextIcon } from "@heroicons/react/solid";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "../../common";
import { Container } from "../../utils";

import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";
import { fetchAllStaffLeave } from "../../api/Leave/getStaffLeave";
import { fetchAllVisitsByStaffAndDate } from "../../api/Visits";

const ExportTimesheetTable = ({ selectedTimesheets, dt }) => {
  const location = useLocation();
  const [timesheetData, setTimesheetData] = useState("");

  const formatDate = (value) =>
    value.toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const dateBodyTemplate = (rowData) => formatDate(rowData.date);
  useEffect(() => {
    const data = selectedTimesheets?.map(async (item) => {
      const date = formatDate(item.date);
      const visitData = await fetchAllVisitsByStaffAndDate(item.staff_id, item.staffName, date);
      const leaveData = await fetchAllStaffLeave(item.staff_id);
      if (visitData.length > 1) {
        return visitData.map((visit) => {
          const duplicatedItem = { ...item };
          duplicatedItem.job_number = !Number.isNaN(visit.job_id) ? visit.job_id + 5000 : "";
          duplicatedItem.start_time = visit.time_on;
          duplicatedItem.end_time = visit.time_off;
          duplicatedItem.leave_type = leaveData
            .filter((leave) => leave.start_date === date)
            .map((leave) => leave.type)
            .join(", ");

          return duplicatedItem;
        });
      }

      return item;
    });

    Promise.all(data)
      .then((results) => {
        setTimesheetData(results.flat());
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  }, [selectedTimesheets]);

  return (
    <Container>
      <div className="mx-auto mt-8">
        <DataTable
          ref={dt}
          value={timesheetData}
          paginator
          paginatorPosition="top|bottom|both"
          showGridlines
          rows={100}
          rowsPerPageOptions={[25, 50, 100]}
          dataKey="id"
          filterDisplay="menu"
          // stripedRows
          // responsiveLayout="scroll"
          globalFilterFields={["staff.staff_name", "comments", "status"]}
          emptyMessage="No timesheets found."
          rowGroupMode="subheader"
          selection={timesheetData}
          // scrollHeight="600px"
          selectionMode="checkbox"
          showSelectionElement={(row) => row.actual_start !== null && row.actual_finish !== null}
          style={{ display: "none" }}
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

          <Column field="job_number" header="Job Number" />
          <Column field="start_time" header="Pre Start Time" />
          <Column field="end_time" header="Close of Day Time" />
          <Column field="leave_type" header="Leave Type" />
        </DataTable>
      </div>
    </Container>
  );
};

export default ExportTimesheetTable;
