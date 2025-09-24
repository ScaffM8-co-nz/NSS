import React, { useEffect, useState } from "react";
import moment from "moment";
import clsx from "clsx";
import { Button, Table, Spinner, Badge } from "../../common";
import { usefetchLoginByEmail } from "../../api/Staff";

export const LoginHistory = ({ email }) => {
  console.log(email);

  const LoginHistoryQuery = usefetchLoginByEmail(email);
  console.log(LoginHistoryQuery, "LoginHistoryQuery");
  if (LoginHistoryQuery.isLoading) {
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!LoginHistoryQuery.data) return null;

  return (
    <div className="w-full mx-auto mt-8">
      <div>
        <h2 className="text-lg px-8 mb-2 leading-6 font-large text-gray-900 mt-6">Login History</h2>

        <Table
          cols={[
            {
              Header: "Email",
              accessor: "email",
            },
            {
              Header: "signed in",
              accessor: "last_sign_in_at",
              Cell: ({ value }) => {
                const date = moment(value).format("MMMM D, YYYY [at] h:mm A");
                return date;
              },
            },
          ]}
          tableData={LoginHistoryQuery?.data}
          searchPlaceholder="Search Leave"
          displayPagination={LoginHistoryQuery?.data?.length}
        />
      </div>
    </div>
  );
};
