import { Input, Dropdown, DateSelect } from "../../../common";
import { CreateFile } from "../CreateFile";

const licenceOptions = [
  { value: "Full", label: "Full" },
  { value: "Restricted", label: "Restricted" },
  { value: "Learner Licence", label: "Learner Licence" },
  { value: "International", label: "International" },
];

const classOptions = [
  { value: "Class 2", label: "Class 2" },
  { value: "Class 4", label: "Class 4" },
  { value: "Class 5", label: "Class 5" },
];

export function HealthSafety({
  values,
  staff,
  handleChange,
  handleBlur,
  setFieldValue,
  setFieldTouched,
}) {
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
      <h3 className="px-4 pt-2 text-lg font-semibold leading-5">Health and Safety Induction</h3>
      <div>
        <div className="flex items-center">
          <DateSelect
            title="Induction Date"
            id="induction_date"
            value={values.induction_date}
            onChange={setFieldValue}
          />
          <DateSelect
            title="Expiry Date"
            id="expiry_date"
            value={values.expiry_date}
            onChange={setFieldValue}
          />
        </div>
        <div className="w-1/2">
          <div>
            <h4 className="text-md font-normal leading-5 px-4">Photo</h4>
            <CreateFile field="photo" setFieldValue={setFieldValue} type="edit" />
          </div>
        </div>
        <div className="w-1/2">
          <Dropdown
            label="H&S Assessed By"
            id="hs_assessed_by"
            value={values.hs_assessed_by}
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
