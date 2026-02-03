import { Button, Paper, Typography } from "@mui/material";
import React from "react";
import MSTextField from "../../../../../customTheme/textField/MSTextField";
import home from "../../../../../assests/homeScreen/home.png";
import "../../student/addNewStudent/AddNewStudent.css";
import { BrowserView, MobileView } from "react-device-detect";
import Btn from "../../../../../customTheme/button/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "../../../../../hook/useSnackbar";
import { addUser } from "../../../../../redux/addUserSlice";
import { RefreshToken } from "../../../../../redux/authSlice";
import formValidation from "../../../../../formValidation/validation";
const Schools = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();
  const { accessToken, refreshToken, tokenExpiry, userRole } = useSelector((state) => state.login)
  const [userData, setUserData] = React.useState({
    userRole: "SCHOOL", city: "", name: "", emailId: "", mobileNumber: "", state: "", address: "",
    schoolCode: "", principalName: ""
  })
  const handleFieldsChange = (e, fieldName) => {
    e.preventDefault()
    setUserData(current => {
      const copy = { ...current }
      copy[fieldName] = e.target.value
      return copy
    })
  }
  // Function handle generation of new School
  const handleSave = () => {
    let header = {
      "Content-Type": "application/json",
      'Accept': 'application/json',
      "Authorization": `Bearer ${accessToken}`
    }
    // var newMessage=formValidation(userData)
    //      if(newMessage==='true') {
    let data = { ...userData }
    const schoolCode = data.schoolCode || '';
    const postalCode = data.postalCode || '';
    const name = data.name || '';
    data.schoolCode = `SC${schoolCode.startsWith('SC') ? schoolCode.substring(2) : schoolCode}${postalCode.slice(-3)}${name.slice(0, 2).toUpperCase()}`
    dispatch(addUser({
      headers: header,
      body: data
    })).then((res) => {
      if (res.payload?.addedBy || res.payload?.userId) {
        displaySnackbar({ message: 'School added successfully. Login credentials sent to their email.' })
        setUserData({
          userRole: userRole, city: "", name: "", emailId: "", mobileNumber: "", state: "", address: "",
          schoolCode: "", principalName: "", postalCode: ""
        })
        // Call callback to refresh list
        if (props.onSchoolAdded) {
          props.onSchoolAdded();
        }
      } else if (res.payload?.error) {
        displaySnackbar({ message: res.payload.error })
      } else if (res.payload?.detail) {
        displaySnackbar({ message: res.payload.detail })
      } else if (res.payload?.message) {
        const msg = res.payload.message.split('.')[0]
        displaySnackbar({ message: msg })
      }
      if (res.payload?.message === "Expired JWT") {
        dispatch(RefreshToken({
          headers: header,
          body: {
            "refreshToken": refreshToken
          }
        })).then((res) => {
          if (res.payload?.accessToken) {
            header["Authorization"] = `Bearer ${res.payload.accessToken}`
            dispatch(addUser({
              headers: header,
              body: data
            })).then((innerRes) => {
              if (innerRes.payload?.userId) {
                displaySnackbar({ message: 'School added successfully' })
                // Call callback to refresh list
                if (props.onSchoolAdded) {
                  props.onSchoolAdded();
                }
              }
            })
          }
        })
      }
    })
    // } else {
    //   displaySnackbar({message:newMessage})
    // }
  }
  return (
    <div className="addStudentManinContainer">
      <div className="addStudentContainer">
        <div className="addStudentHeaderTxtContainer">
          <img src={home} />
          <Typography fontSize="15px" fontWeight="bold" className="schoolText">
            Add New School{" "}
          </Typography>
        </div>
        <div className="addStudentHeaderBtnContainer">
          <BrowserView>
            <Button variant="outlined" className="cancelBtn" onClick={props.handleCancel}>Cancel</Button>
          </BrowserView>
          <MobileView>
            <Btn onClick={() => navigate(-1)} />
          </MobileView>
          <Button style={{ backgroundColor: "#B3DAFF" }} className="saveDataBtn" onClick={handleSave}>Save Data</Button>
        </div>
      </div>
      <form className="addNewSchoolContainer">
        <Paper className="addTextfieldContainer"
          style={{ backgroundColor: "white", borderRadius: '20px' }}
        >
          <div className="AddStudentTextFieldContainer">
            <MSTextField
              id="schoolName" type="text" placeholder="Enter school name"
              value={userData.name}
              label="* School Name" onChange={handleFieldsChange} fieldName="name"
            />
            <MSTextField
              id="schoolPrincipalName" type="text" placeholder="Enter principal's full name"
              value={userData.principalName}
              label="*Principal's Name " onChange={handleFieldsChange} fieldName="principalName"
            />
            <MSTextField
              id="schoolEmailId" type="text" placeholder="Enter Email"
              value={userData.emailId}
              label="*Email" onChange={handleFieldsChange} fieldName="emailId"
            />
          </div>
          <div className="AddStudentTextFieldContainer">
            <MSTextField
              id="schoolCity" type="text" placeholder="Enter city name"
              value={userData.city}
              label="City" onChange={handleFieldsChange} fieldName="city"
            />
            <MSTextField
              id="schoolState" type="text" placeholder="Enter  State"
              value={userData.state}
              label="State" onChange={handleFieldsChange} fieldName="state"
            />
            <MSTextField
              id="schoolMobileNumber" type="text" placeholder="+91 Enter mobile number"
              value={userData.mobileNumber}
              label="*Mobile Number" onChange={handleFieldsChange} fieldName="mobileNumber"
            />
          </div>
          <div className="AddStudentTextFieldContainer">
            <MSTextField
              id="schoolCode" type="text" placeholder="Enter School Code"
              value={userData.schoolCode}
              label=" School Code" onChange={handleFieldsChange} fieldName="schoolCode"
            />
          </div>
          <div>
            <MSTextField
              id="schoolAddress" type="text" placeholder="Enter complete address here"
              value={userData.address}
              label="Address" onChange={handleFieldsChange} fieldName="address"
            />
          </div>
        </Paper>
      </form>
    </div>
  );
};
export default Schools;
