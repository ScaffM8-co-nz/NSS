import React, { useState, useEffect } from "react";
import { FilesApi } from "../../api";

export const VehicleFileLink = ({ id }) => {
    const [data, setData] = useState(null);
    useEffect(()=>{
        const fetchData = async () => {
          const dataQuery = await FilesApi.fetchAllAppFilesById({
                  column:"vehicle_id",
                  fileType:"Vehicle Checklist",
                  id,
              });
              console.log({dataQuery});
              setData(dataQuery[0] ? dataQuery[0].link : null );
        }
        fetchData();
      }, [])

    return   data ? <a href={data} target="_blank" rel="noreferrer" style = {{textDecoration: "underline", color:"blue"}}> Link </a> : "N/A";
}