import React, { useEffect, useState } from "react";
import moment from 'moment'
import { Button, Table, Spinner, Badge } from "../../common";

import { JobsApi } from "../../api";

export const JobvsHours = ({ jobId }) => {
  const timesheetsQuery = JobsApi.useFetchVisitTimesheets(jobId)
  const taskQuery = JobsApi.useGetAllTasks(jobId)

  if (timesheetsQuery.isLoading || taskQuery.isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!timesheetsQuery.data) return null;

  const dataForTable = [{ estatedHours: 0, usedHours: 0 }]

  for (const row of timesheetsQuery.data) {
    const totalStaff = row?.staff_ids?.length
    const start = moment(row.time_in, "HH:mm");
    const finish = moment(row.time_off, "HH:mm");

    if (row.time_off && finish) {
      const duration = moment.duration(finish.diff(start));
      const hours = duration.asHours();
      dataForTable[0].usedHours += Number(hours.toFixed(2) * totalStaff)
    }
  }

  for (const row of taskQuery.data) {
    dataForTable[0].estatedHours += Number(row.total_hours) 
  }

  return (
    <div className="w-full mx-auto mt-8">
      <div>
        <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">
          Visit Timesheets
        </h2>

        <Table
          cols={[
            {
              Header: "Estimated Hours",
              accessor: "estatedHours",
            },
            {
              Header: "Total Hours used",
              accessor: "usedHours",
            },
            // {
            //   Header: "Status",
            //   Cell: ({ row }) => {
            //     const type = row?.original?.status;
            //     return <Badge type={type} text={type} />;
            //   },
            //   width: 60,
            //   accessor: "status",
            // },
          ]}
          tableData={dataForTable}
          searchPlaceholder="Search Timesheets"
          displayPagination={timesheetsQuery?.data?.length}
        />
      </div>
    </div>
  );
};