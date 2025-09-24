import React, { useEffect, useState } from "react";
import { FolderOpenIcon } from "@heroicons/react/solid";
import { Link } from "react-router-dom";
import { fetchJobsByClient } from "../../api/Jobs/getJobsByClient";
import { Table, Button } from "../../common";
import { JobsApi } from "../../api";

export function JobsTable({ clientID }) {
  const [jobs, setJobs] = useState([]);
  // Contact Form
  const [contactForm, setContactForm] = useState(false);
  const [contactId, setContactId] = useState(null);

  const staffData = JobsApi.usefetchAllHandover();

  const jobQuery = JobsApi.useJobs();

  useEffect(() => {
    fetchJobsByClient(clientID).then((data) => {
      for (let index = 0; index < data?.length; index++) {
        data[index].Supervisor = showStaff(data[index].id) || "";
      }
      setJobs(data);
    });
  }, [clientID, staffData.data, jobQuery.data]);

  const showStaff = (job_id) => {
    const data = staffData?.data?.find((e) => e?.job_id === job_id);
    if (!data) return "";

    return data?.staff?.staff_name;
  };
  if (jobQuery.isLoading || staffData.isLoading) {
    return <br />;
  }

  return (
    <div>
      <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">Jobs</h2>

      <div className="px-8 py-2">
        <Button
          type="button"
          onClick={() => {
            setContactId(null);
            setContactForm(true);
          }}
        >
          Add New Contact
        </Button>
      </div>

      <Table
        cols={[
          {
            Header: "Job #",
            accessor: "job_id",
            Cell: ({ row }) => (
              <Link
                key={`details${row.original.id}`}
                to={`/jobs/${row.original.id}/details`}
                className="flex items-center"
              >
                <FolderOpenIcon className="h-4 w-4 text-gray-500 mr-2" />
                <span className="hover:text-gray-800">#{row.original.job_num}</span>
              </Link>
            ),
          },
          {
            Header: "Site Address",
            accessor: "site",
          },
          {
            Header: "Supervisor",
            accessor: "Supervisor",
          },
          {
            Header: "Start Date",
            accessor: "start_date",
          },
          {
            Header: "End Date",
            accessor: "end_date",
          },
          {
            Header: "Job Status",
            accessor: "job_status",
          },
          {
            Header: "On Hire",
            accessor: "on_hire",
          },
          {
            Header: "Brand",
            accessor: "branding",
          },
          {
            Header: "Status",
            accessor: "status",
          },
        ]}
        tableData={jobs}
      />
    </div>
  );
}
