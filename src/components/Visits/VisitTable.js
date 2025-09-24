
import {VisitsApi} from "../../api"

import {  Spinner, Table } from "../../common";


export const VisitTable = ({staffId, staffName, date, getVisitDataTable}) => {

    const visitsQuery = VisitsApi.useGetVisitsByStaffAndDate(staffId, staffName, date);

    if (visitsQuery.isLoading) {
        return (
          <div className="w-full h-48 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        );
    }

    if(!visitsQuery.data) return null;

 
    if(visitsQuery.data) {
      getVisitDataTable(visitsQuery.data);
    }

    return (
        <div className="w-full mx-auto mt-8">
        <div>
          <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">
            Visits
          </h2>
  
          <Table
            cols={[
              {
                Header: "Date",
                accessor: "date",
              },
              {
                Header: "Job Number",
                accessor: "job_id"
              },
              {
                Header: "Pre Start Time",
                accessor: "time_on",
              },
              {
                Header: "Close of Day Time",
                accessor: "time_off",
              }
            ]}
            tableData={visitsQuery?.data}
            searchPlaceholder="Search Visits"
            displayPagination={visitsQuery?.data?.length}
          />
        </div>
      </div>
    )
}