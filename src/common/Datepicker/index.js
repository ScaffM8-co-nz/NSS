import React from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

import "react-datepicker/dist/react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

export function DateSelect({ title, id, value, onChange, error }) {
  return (
    <div className="w-full px-4 py-4">
      <label htmlFor={id} id={`date${id}`} className="block text-sm font-medium text-gray-700">
        {title}
      </label>
      <DatePicker
        id={id}
        autoComplete="off"
        dateFormat="dd/MM/yyyy"
        selected={(value && moment(value, "DD/MM/YYYY").isValid() && moment(value, "DD/MM/YYYY").toDate()) || 
          (moment(value, "MM/DD/YYYY").isValid() && moment(value, "MM/DD/YYYY").toDate()) || ''
        }
        onChange={(val) => {
          if(val) {
          onChange(id, moment(val).isValid() ? moment(val).format("DD/MM/YYYY") : val);
          } else {
            onChange(id, "");
          }
        }}
        className="text-xs border-gray-300 rounded-md shadow-sm"
        // popperPlacement="bottom-end"
      />
      {error && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
}
