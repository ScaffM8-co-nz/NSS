import React, { useState, useEffect } from "react";
import { QuotesApi } from "../../../api";
import { Button } from "../../../common";
import { Container } from "../../../utils";

import { useRatesStore } from "./store";

export const AdminRates = React.memo(({ data, setRates, user, handleChange }) => {
  const columns = ["Service", "Erect & Dismantle", "Hire", "GL Code"];
  const updateRates = QuotesApi.useUpdateAdminRates();

  const updateRate = (id, name, value) => {
    const numericValue = parseFloat(value);
    const updatedValue = Number.isNaN(numericValue) ? value : numericValue;
    setRates(data.map((rate) => (rate.id === id ? { ...rate, [name]: updatedValue } : rate)));
    handleChange(data.map((rate) => (rate.id === id ? { ...rate, [name]: updatedValue } : rate)));
  };

  const updateNameRate = (id, value) => {
    setRates(data.map((rate) => (rate.id === id ? { ...rate, service: value } : rate)));
    handleChange(data.map((rate) => (rate.id === id ? { ...rate, service: value } : rate)));
  };

  const newRate = () => {
    data.push({ id: data.length + 1, service: 'New Rate', type: "Both", erect_fee: 0, hire_fee: 0, gl_code:'' })
    setRates(data)
    handleChange(data)
  }


  const storeRates = () => {
    for (const row of data) {
      updateRates.mutateAsync(row)
    }

  }

  // const handleTrigger = () => {
  //   handleChange();
  // };
  return (
    <>
      {data ? (
        <div className="w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column) => (
                  <>
                    <th className="text-center border border-gray-200 px-1 py-2 text-tiny font-medium text-blue-900 uppercase tracking-wider">
                      {column}
                    </th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((line, index) => (
                <tr key={index}>
                  <td className="px-2 py-1 text-sm bg-white border border-gray-100 whitespace-nowrap w-21">
                    <input
                      id={`rateErect${line?.id}`}
                      type="text"
                      defaultValue={line?.service}
                      className="h-7 rounded-md w-full border border-gray-300 text-gray-900 focus:outline-none"
                      name="rateService"
                      onChange={(e) => updateNameRate(line?.id, e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 text-sm bg-white border border-gray-100 whitespace-nowrap w-12">
                    <input
                      id={`rateErect${line?.id}`}
                      type="number"
                      defaultValue={line?.erect_fee}
                      className="h-7 rounded-md w-full border border-gray-300 text-gray-900 focus:outline-none"
                      name="rateErect"
                      onChange={(e) => updateRate(line?.id, "erect_fee", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 text-sm bg-white border border-gray-100 whitespace-nowrap w-16">
                    <input
                      id={`rateHire${line?.id}`}
                      type="number"
                      defaultValue={line?.hire_fee}
                      className="h-7 rounded-md w-full border border-gray-300 text-gray-900 focus:outline-none"
                      name="rateHire"
                      onChange={(e) => updateRate(line?.id, "hire_fee", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-1 text-sm bg-white border border-gray-100 whitespace-nowrap">
                    <input
                      id={`glCode${line?.id}`}
                      type="text"
                      defaultValue={line?.gl_code}
                      className="h-7 rounded-md w-full border border-gray-300 text-gray-900 focus:outline-none"
                      name="glCode"
                      onChange={(e) => updateRate(line?.id, "gl_code", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <div className="flex items-center">
            <Button className="w-1/2" onClick={() => newRate()}>Add new rate</Button>
            <div className="w-0.5" />
            <Button className="w-1/2" onClick={() => storeRates()}>Save</Button>
          </div>

        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
});
