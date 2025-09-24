import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Badge } from "../Badges";

export function XeroStatus() {
    const [xeroStatus, setXeroStatus] = useState(false);
    const [xeroUrl, setXeroUrl] = useState(false);

    const [fetchedInfo, setFetchedInfo] = useState(false);
    // Active
    useEffect(() => {
        fetch("https://scaff-m8-server.herokuapp.com/xerourl")
            .then(response => response.json())
            .then(data => {
                setXeroStatus(data?.xeroStatus);
                setXeroUrl(data?.xeroUrl)
                setFetchedInfo(true);
            });
    })

    if (!fetchedInfo) {
        return (
            <div className="px-6 flex items-center">
                <Badge type="Pending" text="Xero Status: Loading" />
            </div>
        )
    }

    if (!xeroStatus) {
        return (
            <>
                <div className="px-6 flex items-center">
                    <Badge type="Issue" text="Xero Status: In Error, Login required" />
                </div>
                <br />
                <div className="px-6 flex items-center">
                    <Button label="Login With Xero" onClick={() => window.location.replace(xeroUrl)} />
                </div>
            </>
        )
    }

    return (
        <div className="px-6 flex items-center">
            <Badge type="Active" text="Xero Status: Active" />
        </div>
    )
}