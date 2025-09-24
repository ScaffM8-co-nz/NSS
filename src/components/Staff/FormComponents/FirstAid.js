import { Input, Dropdown, DateSelect } from "../../../common";
import { CreateFile } from "../CreateFile";

export function FirstAid({ values, staff, handleChange, handleBlur, setFieldValue, setFieldTouched }) {
  const renderStaffList = () => {
    if (staff && staff?.length > 0) {
      return staff.map((item) => ({
        label: item.staff_name,
        value: item.id,
      }));
    }
    return [];
  };
  return (
    <div>
      <h3 className="px-4 pt-2 text-lg font-semibold leading-5">First Aid Certificate</h3>
      <div>
        <div className="flex items-center">
          <DateSelect
            title="Issue Date"
            id="first_aid_issue"
            value={values.first_aid_issue}
            onChange={setFieldValue}
          />
          <DateSelect
            title="Expiry Date"
            id="first_aid_expiry"
            value={values.first_aid_expiry}
            onChange={setFieldValue}
          />
        </div>
        <div>
          <h4 className="text-md font-normal leading-5 px-4">Photo</h4>
          <CreateFile field="first_aid_photo" setFieldValue={setFieldValue} type="edit" />
        </div>
        <div className="w-1/2">
          <Dropdown
            label="First Aid Assessed By"
            id="firstaid_assessed_by"
            value={values.firstaid_assessed_by}
            onChangeVal="label"
            onChange={setFieldValue}
            onBlur={setFieldTouched}
            options={renderStaffList()}
          />
        </div>
      </div>
    </div>
  );
}
