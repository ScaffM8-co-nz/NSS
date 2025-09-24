import { Input, Dropdown, DateSelect } from "../../../common";
import { CreateFile } from "../CreateFile";

const kiwisaverOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export function Other({ values, staff, handleChange, handleBlur, setFieldValue, setFieldTouched }) {
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
      <h3 className="px-4 pt-2 text-lg font-semibold leading-5">Other</h3>
      <div className="w-1/2">
        <Input
          title="Height Training"
          id="height_training"
          type="text"
          handleChange={handleChange}
          handleBlur={handleBlur}
          value={values.height_training}
        />
      </div>
      <div className="flex items-center">
        <DateSelect
          title="Height Training Issue"
          id="height_training_issue"
          value={values.height_training_issue}
          onChange={setFieldValue}
        />
        <DateSelect
          title="Height Training Expiry"
          id="height_training_expiry"
          value={values.height_training_expiry}
          onChange={setFieldValue}
        />
      </div>
      <div className="w-1/2">
        <Dropdown
          label="Height Training Assessed By"
          id="height_training_assessed_by"
          value={values.height_training_assessed_by}
          onChangeVal="label"
          onChange={setFieldValue}
          onBlur={setFieldTouched}
          options={renderStaffList()}
        />
      </div>
      <div className="w-1/2">
        <h4 className="text-md font-normal leading-5 px-4">Photo</h4>
        <CreateFile field="other_photo" setFieldValue={setFieldValue} type="edit" />
      </div>
      <div className="flex items-center">
        <Input
          title="IRD #"
          id="ird_num"
          type="text"
          handleChange={handleChange}
          handleBlur={handleBlur}
          value={values.ird_num}
        />
        <DateSelect
          title="Last Drug Test - Date"
          id="last_drug_test"
          value={values.last_drug_test}
          onChange={setFieldValue}
        />
      </div>
      <div className="flex items-center">
        <div className="w-1/2">
          <Dropdown
            label="Kiwisaver"
            id="kiwisaver"
            options={kiwisaverOptions}
            value={values.kiwisaver}
            onChange={setFieldValue}
            onBlur={setFieldTouched}
          />
        </div>
        <div className="w-1/2">
          <h4 className="text-md font-normal leading-5 px-4">Employement Contract</h4>
          <CreateFile field="employement_contract" setFieldValue={setFieldValue} type="edit" />
        </div>
      </div>
    </div>
  );
}
