
import {LeaveApi} from "../../api"
import {  Spinner, Table } from "../../common";


export const LeavesTable = ({staffId, date, getLeaveTableData}) => {


    const leavesQuery = LeaveApi.useStaffLeave(staffId);

    if (leavesQuery.isLoading) {
        return (
          <div className="w-full h-48 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        );
    }

    if(leavesQuery.data) {
        getLeaveTableData(leavesQuery.data);
      }

    return (
        <div className="w-full mx-auto mt-8">
            <div>
                <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">
                    Leave
                </h2>

                <Table
                    cols={[
                        {
                            Header: "Date",
                            accessor: "start_date"
                        },
                        {
                            Header: "Leave Type",
                            accessor: "type"
                        },
                        {
                            Header: "Comments",
                            accessor: "comments"
                        }
                    ]}
                    tableData={leavesQuery?.data.filter(leave => leave.start_date === date)}
                    displayPagination={leavesQuery?.data?.filter(leave => leave.start_date === date).length}
                />
            </div>
        </div>
    )

}