import { Input, Dropdown, DateSelect, Checkbox } from "../../../common";
import { CreateFile } from "../CreateFile";

const classOptions = [
  { value: "SOP001 - Forklift", label: "SOP001 - Forklift" },
  { value: "SOP002 - Drop Saw", label: "SOP002 - Drop Saw" },
  { value: "SOP003 - Saber Saw", label: "SOP003 - Saber Saw" },
  { value: "SOP004 - Circular Saw", label: "SOP004 - Circular Saw" },
  { value: "SOP005 - Drill", label: "SOP005 - Drill" },
  { value: "SOP006 - Angle Grinder", label: "SOP006 - Angle Grinder" },
];

export function SafeProcedure({
  values,
  handleChange,
  handleBlur,
  setFieldValue,
  setFieldTouched,
}) {
  return (
    <div className="py-4">
      <h3 className="px-4 pt-2 text-lg font-semibold leading-5">Safe Operating Procedure</h3>
      <div>
        <div className="flex items-center">
          {/* <Dropdown
            label="SOP Training"
            id="sop_train"
            options={classOptions}
            value={values.sop_train}
            onChange={setFieldValue}
            onBlur={setFieldTouched}
          /> */}
          <Checkbox
            title="SOP Training"
            options={classOptions}
            id="sop_train"
            values={values.sop_train}
            onChange={setFieldValue}
          />
        </div>
      </div>
    </div>
  );
}
