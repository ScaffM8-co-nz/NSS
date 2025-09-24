import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import moment from "moment";
import { Icon } from "leaflet";
import { saveAs } from 'file-saver';
import { Button } from "primereact/button";
import { TimesheetsApi } from "../../api";
import { Spinner, Table } from "../../common";
import { TwoColumnDetails, Section } from "../../common/Details";
import { fetchAllVisitsByStaffAndDate } from "../../api/Visits/getVisitsByStaffAndDate"
import { fetchVisitTimesheets } from "../../api/Jobs/getJobVisitTimesheets"
import { VisitTable } from "../../components/Visits/VisitTable";
import { LeavesTable } from "../../components/Leave/LeavesTable";

export const TimesheetDetails = () => {
    
    const { timesheetId } = useParams(0);
    const { data, isLoading, isSuccess } = TimesheetsApi.useFetchTimesheet(timesheetId);
    const [visitTableData, setVisitTableData] = useState([]);
    const [leaveTableData, setLeaveTableData] = useState([]);
    let totalHours = 0;


    const getVisitDataTable = (visitData) => {
        setVisitTableData(visitData);
    }

    const getLeaveTableData = (leaveData) => {
        setLeaveTableData(leaveData);
    }



    const getLargestArrayLength = (arrays) => {
        let largestArray = [];
        for (let i = 0; i < arrays.length; i++) {
            if (arrays[i].length > largestArray.length) {
                largestArray = arrays[i];
            }
        } 
        return largestArray;
    }


    const calculateTotalHours = () => {

        if(data.time_off) {
            const start = moment(data.time_on, "HH:mm");
            const finish = moment(data.time_off, "HH:mm");

            const duration = moment.duration(finish.diff(start));
            totalHours = duration.asHours();
        }
    }

    if (isLoading) {
        return (
            <div className="w-full h-48 flex justify-center items-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if(isSuccess) {
        calculateTotalHours();
    }

    return (
        <div className="w-full mx-auto mt-8 mb-28">

              <TwoColumnDetails heading="Timesheet Details" isEditable={false}>
                <Section title="Staff Name" content={data.staff.staff_name}/>
                <Section title="Total Hours" content={totalHours?.toFixed(2)}/>
                <Section title="Signed In Time" content={data.time_on}/>
                <Section title="Signed Out Time" content={data.time_off}/>
                <Section title="Sign in Location" content={MapContainerTimesheet(data.longitude_sign_in, data.latitude_sign_in)}/>
                <Section title="Sign out Location" content={MapContainerTimesheet(data.longitude_sign_out, data.latitude_sign_out)}/>
              </TwoColumnDetails>

            <VisitTable staffId={data.staff_id} date={data.date} staffName={data.staff.staff_name} getVisitDataTable={getVisitDataTable} />
             

            <LeavesTable staffId={data.staff_id} date={data.date} getLeaveTableData={getLeaveTableData} />
        </div>
    );
}


const MapContainerTimesheet = (Longitude, Latitude) => {

    const markIconMap = new Icon({
        iconUrl: '/marker.svg',
        iconSize: [40, 40]
    });

    return (
        <MapContainer
            style={{ height: "45vh", width: "100%", zIndex: "0" }}
            center={[Latitude || 0, Longitude || 0]}
            zoom="16" >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker icon={markIconMap} position={[Latitude || 0, Longitude || 0]}>
                <Popup>
                    Vehicle
                </Popup>
            </Marker>
        </MapContainer>
    )
}