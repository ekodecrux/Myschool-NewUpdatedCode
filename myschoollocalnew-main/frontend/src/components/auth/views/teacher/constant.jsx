import { Button, styled, Switch, Typography } from "@mui/material";
import React from "react";
import CheckBtnIcon from "../../../../assests/checkBtnIcon.svg";
import { ReactComponent as SettingsIcon } from "../../../../assests/blueSettingIcon.svg";
import { UserAccess } from "../../../../redux/fetchUsersSlice";
import { useDispatch, useSelector } from "react-redux";
import CreditDialog from "../../../../uicomponent/CreditsDialog/index";
import { isMobile } from "react-device-detect";
import  Crossicon from "../../../../assests/homeScreen/crossicon.svg";
const ToggleSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 52,
  height: 26,
  padding: 0,
  paddingBottom: 2,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(26px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "white",
        opacity: 1,
        border: "1px solid #3C5EA2",
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#3C5EA2",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": {
    background: `url(${CheckBtnIcon})`,
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
    background:
      "transparent linear-gradient(180deg, #335089 0%, #5888EA 100%) 0% 0% no-repeat",
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "white",
    border: "1px solid #3C5EA2",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
const HandleBtnRender = (params, direction) => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();
  const { accessToken, refreshToken, tokenExpiry } = useSelector(
    (state) => state.login
  );
  let header = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const handleUserAccess = (checked, params) => {
    dispatch(
      UserAccess({
        headers: header,
        body: {
          userId: params.row.userId,
          disable: checked,
        },
      })
    );
  };
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {direction === "left" || direction === "center" ? <>
          <ToggleSwitch
            defaultChecked={params.row.disabled}
            onChange={(e) => handleUserAccess(e.target.checked, params)}
          />
        </> : null}
        {direction === "right" || direction === "center" ? <Button
          variant="outlined"
          className="manageBtn"
          onClick={() => setOpen(true)}
          startIcon={<SettingsIcon />}
        >
          {isMobile ? <p style={{fontSize:11, marginBottom:0}}>Manage Credits</p> : <p>Manage Credits</p>}
        </Button> : null}
         <CreditDialog
          open={open}
          handleClose={() => setOpen(false)}
          params={params}
        /> 
      </div>
    </>
  );
};
export const columns = [
  {
    field: "teacherCode",
    headerName: "Teacher Code",
    width: 120,
    minWidth: 100,
    editable: false,
  },
  {
    field: "email",
    headerName: "Teacher ID",
    width: 180,
    minWidth: 150,
    editable: false,
  },
  {
    field: "name",
    headerName: "Teacher Name",
    width: 140,
    minWidth: 120,
    editable: false,
    cellClassName: "textFontProxima blueColorText",
  },
  {
    field: "mobileNumber",
    headerName: "Mobile Number",
    width: 120,
    minWidth: 100,
    editable: false,
    cellClassName: "textFontProxima blueColorText",
  },
  {
    field: "schoolCode",
    headerName: "School Code",
    width: 110,
    minWidth: 90,
    editable: false,
  },
  {
    field: "schoolName",
    headerName: "School Name",
    width: 150,
    minWidth: 120,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.schoolName || '-'}</div>;
    },
  },
  {
    field: "cityState",
    headerName: "City, State",
    width: 130,
    minWidth: 100,
    editable: false,
    renderCell: (params) => {
      return (
        <div>
          {params.row.city || ''}{params.row.city && params.row.state ? ', ' : ''}{params.row.state || ''}
        </div>
      );
    },
  },
  {
    field: "credits",
    headerName: "Credits",
    width: 80,
    minWidth: 60,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.credits == null ? 0 : params.row.credits}</div>;
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 180,
    minWidth: 150,
    renderCell: (params) => HandleBtnRender(params, 'center'),
    editable: false,
  },
];
export const teacherMobileViewColumns = [
  {
    field: "teacherCode",
    flex: 0.5,
    headerName: (
      <div>
        <Typography>Teacher Code</Typography>
        <Typography>Teacher ID</Typography>
        <Typography>Teacher Name</Typography>
      </div>
    ),
    renderCell: (props) => (
      <div>
        <Typography>{props.row.teacherCode}</Typography>
        <Typography>{props.row.email}</Typography>
        <Typography>
          {props.row.name}, {props.row.state}
        </Typography><br/>
        <>{HandleBtnRender(props, "left")}</>
      </div>
    ),
  },
  {
    fieldName: "enable",
    flex: 0.5,
    headerName: (
      <div>
        <Typography>Mobile No</Typography>
        <Typography>City, State </Typography>
        <Typography>Students Enrolled</Typography>
      </div>
    ),
    renderCell: (props, direction) => (
      <div>
        <Typography>{props.row.mobileNumber || '-'}</Typography>
        <Typography>{props.row.city || ''}{props.row.city && props.row.state ? ', ' : ''}{props.row.state || '-'}</Typography>
         <Typography>{props.row.studentsEnrolled ? props.row.studentsEnrolled : "N/A"}</Typography><br/>
        {HandleBtnRender(props, "right")}   
      </div>
    ),
  },
];
