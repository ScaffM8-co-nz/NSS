import React, { useState, useEffect } from "react";
import styled from "styled-components";
import clsx from "clsx";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import { PencilAltIcon, FolderOpenIcon } from "@heroicons/react/solid";

import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

import "primeicons/primeicons.css";
import "primereact/resources/themes/fluent-light/theme.css";
import "primereact/resources/primereact.css";

import { Container } from "../../utils";

import { PageHeading, Badge } from "../../common";
import { AssetsApi } from "../../api";
import { CreateAsset, typeDropdowns, categoryDropdowns } from "../Assets";

export { AssetDetails } from "../Jobs/Details";

export const AssignedAssets = ({ staff }) => {
    const assetQuery = AssetsApi.useAssetsByStaff(staff);
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const [filters, setFilters] = useState(null);
    const [globalFilterValue1, setGlobalFilterValue] = useState("");

    const dt = React.useRef(null);
    useEffect(() => {
        initFilters();
    }, []);

    const formatDate = (value) =>
        value.toLocaleDateString("en-NZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            asset_category: { value: null, matchMode: FilterMatchMode.EQUALS },
            asset_type: { value: null, matchMode: FilterMatchMode.EQUALS },
            last_inspected: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
            },
            next_inspection: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
            },
            asset_expiry: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
            },
            status: { value: "Active", matchMode: FilterMatchMode.EQUALS },
        });
        setGlobalFilterValue("");
    };

    const dateBodyTemplate = (rowData, field) => {
        if (rowData[field]) {
            const date = moment(rowData[field], "DD/MM/YYYY");
            let isNextWeek = date.diff(moment(), "days");

            if (field === "date_assigned") {
                isNextWeek = 10; // this override for last_inspected is for maintain the black color in the font for this field
            }
            return (
                <span
                    className={clsx(
                        isNextWeek <= 0 ? "text-red-500" : "",
                        isNextWeek > 0 && isNextWeek < 8 ? "text-yellow-500" : "",
                        "font-semibold text-center"
                    )}
                >
                    {rowData[field]}
                    {/*
                    date&&formatDate(rowData[field])
                    */}
                </span>
            );
        }
        return "";
    };

    return (
        <div className="mx-auto mt-8">
            <DataTable
                ref={dt}
                value={assetQuery.data}
                loading={assetQuery.isLoading}
                paginator
                paginatorPosition="top|bottom|both"
                showGridlines
                rows={25}
                rowsPerPageOptions={[25, 50, 100]}
                dataKey="id"
                filters={filters}
                filterDisplay="menu"
                // stripedRows
                // responsiveLayout="scroll"
                globalFilterFields={[
                    "manufacture_num",
                    "asset_category",
                    "assigned_to",
                ]}
                emptyMessage="No staff found."
                // scrollHeight="600px"
            >
                {/* <Column field="job_id" header="Job" /> */}
                <Column
                    header="Asset #"
                    field="id"
                    // filterField="time_on"
                    style={{ maxWidth: "8rem", textAlign: "center" }}
                    body={(row) => (

                        <span className="hover:text-gray-800">{row.id + 1000}</span>

                    )}
                />
                <Column header="Manufactures #" field="manufacture_num" />
                <Column header="Assigned To" field="assigned_to" style={{ minWidth: "10rem" }} />
                <Column
                    header="Date Assigned"
                    field="date_assigned"
                    body={(data) => dateBodyTemplate(data, "date_assigned")}
                    dataType="date"
                // style={{ minWidth: "10rem" }}
                />
            </DataTable>
        </div>
    );
};
