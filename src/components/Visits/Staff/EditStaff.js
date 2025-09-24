import React from "react";
import Select from "react-select";
import { StaffApi } from "../../../api";

export function EditStaff({ setFieldValue, type = "create", staff_ids = [], staff_labels = [] }) {
  // console.log(staff_ids, "values");
  const staffData = StaffApi.useStaff();

  const renderStaffList = () => {
    if (staffData?.data && staffData?.data?.length > 0) {
      return staffData.data.map((staff) => ({
        label: staff.staff_name,
        value: staff.id,
      }));
    }
    return [];
  };
  if (!staff_ids || staff_ids.length === 0 || !staffData?.data) {
        return (<div>Loading...</div>);
  }

  const staff_list = staff_labels.map((label, index) => ({ label, value: staff_ids[index] }));

  // console.log(result, 'result');

  // const displayStaff = React.useMemo(() => {
  //   console.log("update");
  //   if (!staff_ids || staff_ids.length === 0 || !staffData?.data) {
  //     return [];
  //   }

  //   return staffData.data
  //     .filter((staff) => staff_ids.includes(staff.id.toString()))
  //     .map((staff) => ({
  //       label: staff.staff_name,
  //       value: staff.id,
  //     }));
  // }, [staff_ids, staffData]);

  // console.log(displayStaff, "displayStaff");
  return (
    <div className="flex items-center">
      <div className="w-full px-4 py-4">
        {" "}
        <label id="staff" htmlFor="staff" className="block mb-1 text-sm font-medium text-gray-700">
          Staff
        </label>
        <Select
          isMulti
          name="staff"
          id="staff"
          options={renderStaffList()}
          value={staff_list}
          onChange={(value) => {
            const staffVals = value.map((item) => item.value);
            const staffLabels = value.map((item) => item.label);
            setFieldValue("staff_ids", staffVals);
            setFieldValue("staff_labels", staffLabels);
          }}
          isLoading={renderStaffList.isLoading}
          className="w-full basic-multi-select"
          classNamePrefix="select"
        />
      </div>
    </div>
  );
}
