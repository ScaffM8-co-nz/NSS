import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchClient } from "../../api/Clients";
import { Spinner } from "../../common"
import { FileList } from "../../components/Files";
import { TableContacts } from "../../components/Contacts"
import { TwoColumnDetails, Section } from "../../common/Details";
import { JobsTable } from "../../components/Jobs/JobsTable";

export const ClientDetails = () => {
  const [client, setClient] = useState([]);
  const location = useLocation();
  const { clientId } = useParams(0);

  useEffect(() => {
    fetchClient(clientId).then((data) => setClient(data));
  }, [clientId]);

  const editPage = {
    pathname: `/clients/${clientId}/editClient`,
    state: { background: location, name: "editClient" },
  };

  if (client.length === 0) {
    return (<Spinner />)
  }
  
  return (
    <div className="w-full mx-auto mt-8">
      {client && (
        <TwoColumnDetails heading="Client Details" editBtn="Edit Client" editLink={editPage} isEditable>
          <Section title="Client" content={client.client_name} />
          <Section title="Client Phone" content={client.phone} />
          <Section title="Client Email" content={client.email} />
          <Section title="Status" content={client.status} />
          <Section title="Billing Address" content={client.billing_address} />
          <Section title="Main Contact Name" content={client.main_contact?.name} />
          <Section title="Main Contact Phone" content={client.main_contact?.phone} />
          <Section title="Main Contact Email" content={client.main_contact?.email} />
        </TwoColumnDetails>
      )}
      <div>
        <FileList title="Client Notes & Files" column="client_id" type="clients" id={clientId} />
      </div>
      <div>
        <TableContacts clientId={clientId} />
      </div>
      <div>
        <JobsTable clientID={clientId} />
      </div>
      <br />
    </div>
  );
};
