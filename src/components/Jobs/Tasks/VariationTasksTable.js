import React, { useEffect, useState } from "react";

import { PlusCircleIcon, PencilAltIcon } from "@heroicons/react/outline";
import { Button, Table, Spinner } from "../../../common";

import { JobsApi } from "../../../api";

import { CreateVariation } from "./CreateVariation";
import { UpdateTask } from "./UpdateTask";
import { DeleteTask } from "./DeleteTask";

export const VariationTasks = ({ jobId }) => {
  const [open, setOpen] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [openTaskEdit, setOpenTaskEdit] = useState(false);

  const tasksQuery = JobsApi.useVariationTasks(jobId);

  if (tasksQuery.isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tasksQuery.data) return null;
  
  return (
    <div className="w-full mx-auto mt-8">
      <div>
        <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">
          Variation Tasks
        </h2>
        <div className="px-8 py-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => setOpen(true)}
            startIcon={<PlusCircleIcon className="w-4 h-4" />}
          >
            Create Variation Task
          </Button>
        </div>
        <Table
          cols={[
            {
              Header: "Zone",
              accessor: "zone",
            },
            {
              Header: "Zone Label",
              accessor: "zone_label",
            },
            {
              Header: "Type",
              accessor: "type",
            },
            {
              Header: "Description",
              accessor: "description",
            },
            {
              Header: "Total Hours",
              accessor: "total_hours",
            },
            {
              Header: "% Erect",
              accessor: "percentage_erect"
            },
            {
              Header: "% Dismantle",
              accessor: "percentage_dismantle",
            },
            {
              Header: "% Completed",
              accessor: "percentage_complete",
            },
            {
              Header: "Variation Quote #",
              accessor: "quotes.quote_num",
            },
            {
              Header: "Created By",
              accessor: "created_by",
            },
            {
              Header: "PO Number",
              accessor: "PO_Number",
            },
            {
              Header: "Requester",
              accessor: "Requester",
            },
            {
              Header: "Quote",
              accessor: "variation_quote_id",
              Cell: ({ row }) => (
                <a href={`/quotes/${row.original.variation_quote_id}/details`}>URL</a>
              ),
              width: 60,
            },
            {
              Header: "Edit",
              accessor: "edit",
              Cell: ({ row }) => (
                <button
                  type="button"
                  onClick={() => {
                    setTaskId(row.original.id);
                    setOpenTaskEdit(true);
                  }}
                >
                  <PencilAltIcon className="text-gray-600 h-4 w-4" />
                </button>
              ),
              width: 60,
            },
            {
              Header: "Delete",
              accessor: "delete",
              Cell: ({ row }) => <DeleteTask taskId={row.original.id} />,
              width: 60,
            },
          ]}
          tableData={tasksQuery.data}
          displayPagination={tasksQuery?.data?.length}
          searchPlaceholder="Search Variations"
        />
      </div>
      {taskId && openTaskEdit && (
        <UpdateTask taskId={taskId} jobId={jobId} open={openTaskEdit} setOpen={setOpenTaskEdit} type="variation_tasks" />
      )}
      <CreateVariation jobId={jobId} open={open} setOpen={setOpen} />
    </div>
  );
};
