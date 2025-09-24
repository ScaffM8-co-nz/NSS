import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import { Formik } from "formik";
import { SideModal, Input, Dropdown, Address, Spinner, DateSelect, Checkbox } from "../../common";
import { useAuth } from "../../contexts/Auth";
import { useCreateStaff, fetchStaff, fetchAllStaff, useUpdateStaff } from "../../api/Staff";
import {
  BuildingPassport,
  DriverLicence,
  HealthSafety,
  Other,
  SafeProcedure,
  ScaffoldingCert,
  FirstAid,
} from "./FormComponents";

import { statusOptions } from "../../utils";

const typeOptions = [
  { value: "Employee", label: "Employee" },
  { value: "Foreman", label: "Foreman" },
  { value: "Office", label: "Office" },
  { value: "Scaffolder", label: "Scaffolder" },
  { value: "Truck Driver", label: "Truck Driver" },
  { value: "Application", label: "Application" },
  { value: "Contractor", label: "Contractor" },
  { value: "Yard Person", label: "Yard Person" },
];

const accessToPortalOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
]

export function StaffForm({ heading, open, setOpen, formType = "create" }) {
  const { inviteUser, deleteUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();

  const history = useHistory();
  const { staffId } = useParams();
 
  useEffect(() => {
    let isCurrent = true;

    if (!open && staffId) {
      history.goBack();
    }
    if (staffId) {
      fetchStaff(staffId).then((data) => {
        if (isCurrent) setStaff(data);
      });
    }
    renderStaffList();
    return () => {
      isCurrent = false;
    };

    async function renderStaffList() {
      const res = await fetchAllStaff();
      if (!isCurrent) return;
      setStaffList(res);
    }
  }, [staffId, open]);

  if (formType === "edit" && !staff.id)
    return (
      <div className="w-full h-48 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  return (
    <div>
      <Formik
        initialValues={{
          // access to portal
          accessToPortal: staff?.accessToPortal || "No",
          // Main Staff Details
          staff_name: staff?.staff_name || "",
          type: staff?.type || "",
          mobile: staff?.mobile || "",
          email: staff?.email || "",
          position: staff?.position || "",
          street: staff?.street || "",
          street2: staff?.street_2 || "",
          city: staff?.city || "",
          postal: staff?.post_code || "",
          pin: staff?.pin || "",
          start_date: staff?.start_date || "",
          dob: staff?.dob || "",

          // Drivers Licence Section
          driver_licence: staff?.driver_licence || "",
          licence_type: staff?.licence_type || "",
          licence_class2: staff?.licence_class2 || [],
          endorsement: staff?.endorsement || "",
          endorsement_complete_date: staff?.endorsement_complete_date || "",
          endorsement_expiry: staff?.endorsement_expiry || "",
          photo_front: staff?.photo_front || "",
          photo_back: staff?.photo_back || "",
          licence_assessed_by: staff?.licence_assessed_by || "",

          // Health & Safety Section
          induction_date: staff?.induction_date || "",
          expiry_date: staff?.expiry_date || "",
          photo: staff?.photo || "",
          hs_assessed_by: staff?.hs_assessed_by || "",

          // Building construction section
          passport_num: staff?.passport_num || "",
          passport_type: staff?.passport_type || "",
          passport_issue: staff?.passport_issue || "",
          passport_expiry: staff?.passport_expiry || "",
          passport_photo: staff?.passport_photo || "",
          site_safe_assessed_by: staff?.site_safe_assessed_by || "",

          // First aid section
          first_aid_issue: staff?.first_aid_issue || "",
          first_aid_expiry: staff?.first_aid_expiry || "",
          first_aid_photo: staff?.first_aid_photo || "",
          firstaid_assessed_by: staff?.firstaid_assessed_by || "",

          // Safe Cert section
          cert_num: staff?.cert_num || "",
          cert_issue_date: staff?.cert_issue_date || "",
          cert_expiry_date: staff?.cert_expiry_date || "",
          cert_photo: staff?.cert_photo || "",
          scaff_cert_assessed_by: staff?.scaff_cert_assessed_by || "",

          // Safe Op section
          sop_train: staff?.sop_train || [],

          // Other section
          height_training: staff?.height_training || "",
          height_training_issue: staff?.height_training_issue || "",
          height_training_expiry: staff?.height_training_expiry || "",
          height_training_assessed_by: staff?.height_training_assessed_by || "",
          other_photo: staff?.other_photo || "",
          ird_num: staff?.ird_num || "",
          last_drug_test: staff?.last_drug_test || "",
          kiwisaver: staff?.kiwisaver || "",
          employement_contract: staff?.employement_contract || "",

          status: staff?.status || "Active",
        }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setSubmitting(true);

          const staffPayload = {
            staff_name: values.staff_name,
            type: values.type,
            mobile: values.mobile,
            email: values.email,
            position: values.position,
            street: values.street,
            street_2: values.street_2,
            city: values.city,
            post_code: values.post_code,
            pin: values.pin,
            status: values.status,
            start_date: values.start_date
              ? moment(values.start_date, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            dob: values.dob ? moment(values.dob, "DD/MM/YYYY").format("DD/MM/YYYY") : "",

            // Drivers Licence Section
            driver_licence: values.driver_licence,
            licence_type: values.licence_type,
            licence_class2: values.licence_class2,
            endorsement: values.endorsement,
            endorsement_complete_date: values.endorsement_complete_date
              ? moment(values.endorsement_complete_date, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            endorsement_expiry: values.endorsement_expiry
              ? moment(values.endorsement_expiry, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            photo_front: values.photo_front,
            photo_back: values.photo_back,
            licence_assessed_by: values.licence_assessed_by,

            // Health & Safety Section
            induction_date: values.induction_date
              ? moment(values.induction_date, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            expiry_date: values.expiry_date
              ? moment(values.expiry_date, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            photo: values.photo,
            hs_assessed_by: values.hs_assessed_by,

            // Building construction section
            passport_num: values.passport_num,
            passport_type: values.passport_type,
            passport_issue: values.passport_issue
              ? moment(values.passport_issue, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            passport_expiry: values.passport_expiry
              ? moment(values.passport_expiry, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            passport_photo: values.passport_photo,
            site_safe_assessed_by: values.site_safe_assessed_by,

            // First aid section
            first_aid_issue: values.first_aid_issue
              ? moment(values.first_aid_issue, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            first_aid_expiry: values.first_aid_expiry
              ? moment(values.first_aid_expiry, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            first_aid_photo: values.first_aid_photo,
            firstaid_assessed_by: values.firstaid_assessed_by,

            // Safe Cert section
            cert_num: values.cert_num,
            cert_issue_date: values.cert_issue_date
              ? moment(values.cert_issue_date, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            cert_expiry_date: values.cert_expiry_date
              ? moment(values.cert_expiry_date, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            cert_photo: values.cert_photo,
            scaff_cert_assessed_by: values.scaff_cert_assessed_by,

            // Safe Op section
            sop_train: values.sop_train,

            // Other section
            height_training: values.height_training,
            height_training_expiry: values.height_training_expiry
              ? moment(values.height_training_expiry, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            height_training_issue: values.height_training_issue
              ? moment(values.height_training_issue, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            height_training_assessed_by: values.height_training_assessed_by,
            other_photo: values.other_photo,
            ird_num: values.ird_num,
            last_drug_test: values.last_drug_test
              ? moment(values.last_drug_test, "DD/MM/YYYY").format("DD/MM/YYYY")
              : "",
            kiwisaver: values.kiwisaver,
            employement_contract: values.employement_contract,
            accessToPortal: values.accessToPortal
          };

          try {
            let resultUser;
            if (formType === "edit") {
              resultUser = await updateStaffMutation.mutateAsync({
                staff: staffPayload,
                staffId: staff?.id,
              });
            } else {
              resultUser = await createStaffMutation.mutateAsync(staffPayload);
            }

            switch (values.accessToPortal) {
              case "Yes":
                inviteUser(resultUser[0].email);
                break;
              case "No":
                deleteUser(resultUser[0].email);
                break;
              default:
                break;
            }

            setOpen(false);
            resetForm();
          } catch (err) {
            console.log("ERROR CREATING STAFF", err);
          }
        }}
      >
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          setFieldTouched,
        }) => (
          <SideModal
            heading={heading}
            open={open}
            setOpen={setOpen}
            handleSubmit={handleSubmit}
            isLoading={isSubmitting}
            formType={formType}
          >
            <div className="flex items-center">
              <Input
                title="Staff Name"
                id="staff_name"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.staff_name}
              />
              <Dropdown
                label="Type"
                id="type"
                options={typeOptions}
                value={values.type}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>
            <div className="flex items-center">
              <Input
                title="Contact #"
                id="mobile"
                type="text"
                icon="phone"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.mobile}
              />
              <Input
                title="Contact Email"
                id="email"
                type="email"
                icon="email"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.email}
              />
            </div>
            <div className="flex items-center">
              <Dropdown
                label="Access To Portal"
                id="accessToPortal"
                options={accessToPortalOptions}
                value={values.accessToPortal}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>
            <div className="flex items-center">
              <Input
                title="Position"
                id="position"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.position}
              />
              <Input
                title="PIN"
                id="pin"
                type="text"
                handleChange={handleChange}
                handleBlur={handleBlur}
                value={values.pin}
              />
            </div>
            <Address
              streetId="street"
              streetId2="street2"
              cityId="city"
              postalId="postal"
              streetVal={values.street}
              street2Val={values.street2}
              cityVal={values.city}
              postalVal={values.postal}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <div className="flex items-center">
              <DateSelect
                title="Start Date"
                id="start_date"
                value={values.start_date}
                onChange={setFieldValue}
              />
              <DateSelect
                title="Date of Birth"
                id="dob"
                value={values.dob}
                onChange={setFieldValue}
              />
            </div>
            <DriverLicence
              values={values}
              staff={staffList}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <HealthSafety
              values={values}
              staff={staffList}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <BuildingPassport
              values={values}
              staff={staffList}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <FirstAid
              values={values}
              staff={staffList}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <ScaffoldingCert
              values={values}
              staff={staffList}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <SafeProcedure
              values={values}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <Other
              values={values}
              staff={staffList}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
            />
            <div className="w-1/2">
              <Dropdown
                label="Status"
                id="status"
                options={statusOptions}
                value={values.status}
                onChange={setFieldValue}
                onBlur={setFieldTouched}
              />
            </div>
          </SideModal>
          
        )}
      </Formik>
    </div >
  );
}
