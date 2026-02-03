import { Button, styled, Switch, Typography } from "@mui/material";
import CheckBtnIcon from "../../../../assests/checkBtnIcon.svg";
import { ReactComponent as SettingsIcon } from "../../../../assests/blueSettingIcon.svg";
import CreditDialog from "../../../../uicomponent/CreditsDialog";
import React from "react";
import { UserAccess } from "../../../../redux/fetchUsersSlice";
import { useDispatch, useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
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
    padding: null,
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
  const dispatch = useDispatch();
  const { accessToken, refreshToken, tokenExpiry } = useSelector(
    (state) => state.login
  );
  const [open, setOpen] = React.useState(false);
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
        {direction === "left" || direction === "center" ? (
          <>
            <ToggleSwitch className='toggleSwitch'
              defaultChecked={params.row.disabled}
              onChange={(e) => handleUserAccess(e.target.checked, params)}
            />
          </>
        ) : null}
        {direction === "right" || direction === "center" ? (
          <>
            <Button
              variant="outlined"
              className="manageBtn"
              onClick={() => setOpen(true)}
              startIcon={<SettingsIcon />}
            >
              {isMobile ? <p style={{fontSize:11, marginBottom:0}}>Manage Credits</p> : <p>Manage Credits</p>}
            </Button>
            <CreditDialog
              open={open}
              handleClose={() => setOpen(false)}
              params={params}
            />
          </>
        ) : null}
        {/* <Button variant="outlined" className="manageBtn" startIcon={<deleteIcon />}>Delete Data</Button> */}
      </div>
    </>
  );
};
export const columns = [
  {
    field: "schoolCode",
    headerName: "School Code",
    width: 110,
    minWidth: 100,
    editable: false,
  },
  {
    field: "name",
    headerName: "School Name",
    width: 160,
    minWidth: 140,
    editable: false,
    cellClassName: "textFontProxima blueColorText",
  },
  {
    field: "principalName",
    headerName: "Principal",
    width: 130,
    minWidth: 110,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.principalName || '-'}</div>;
    },
  },
  {
    field: "mobileNumber",
    headerName: "Phone",
    width: 120,
    minWidth: 100,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.mobileNumber || '-'}</div>;
    },
  },
  {
    field: "cityState",
    headerName: "City, State",
    width: 140,
    minWidth: 120,
    editable: false,
    renderCell: (params) => {
      const city = params.row.city || '';
      const state = params.row.state || '';
      if (!city && !state) return <div>-</div>;
      return (
        <div>
          {city}{city && state ? ', ' : ''}{state}
        </div>
      );
    },
  },
  {
    field: "address",
    headerName: "Address",
    width: 150,
    minWidth: 120,
    editable: false,
    renderCell: (params) => {
      return <div title={params.row.address || '-'}>{params.row.address || '-'}</div>;
    },
  },
  {
    field: "teachersEnrolled",
    headerName: "Teachers",
    width: 90,
    minWidth: 80,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.teachersEnrolled || 0}</div>;
    },
  },
  {
    field: "studentsEnrolled",
    headerName: "Students",
    width: 90,
    minWidth: 80,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.studentsEnrolled || 0}</div>;
    },
  },
  {
    field: "credits",
    headerName: "Credits",
    width: 80,
    minWidth: 70,
    editable: false,
    renderCell: (params) => {
      return <div>{params.row.credits == null ? 0 : params.row.credits}</div>;
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    minWidth: 180,
    borderRadius: "10px",
    renderCell: (params) => HandleBtnRender(params,'center'),
    editable: false,
  },
  {
    field: "enable",
    headerName: "Enable",
    hide: true,
  },
];
export const mobileViewColumns = [
  {
    field: "schoolCode",
    flex: 0.5,
    headerName: (
      <div>
        <Typography>School Code</Typography>
        <Typography>School Name</Typography>
        <Typography>Principal</Typography>
      </div>
    ),
    renderCell: (props) => (
      <div>
        <Typography>{props.row.schoolCode || '-'}</Typography>
        <Typography>{props.row.name || '-'}</Typography>
        <Typography>{props.row.principalName || '-'}</Typography>
        <Typography style={{fontSize: '0.8em', color: '#666'}}>{props.row.mobileNumber || '-'}</Typography>
        <Button style={{display: 'contents'}}> {HandleBtnRender(props, "left")} </Button><br/>
      </div>
    ),
  },
  {
    fieldName: "enable",
    flex: 0.5,
    headerName: (
      <div>
        <Typography>City, State</Typography>
        <Typography>Teachers</Typography>
        <Typography>Students</Typography>
      </div>
    ),
    renderCell: (props) => (
      <div>
        <Typography>{props.row.city || '-'}{props.row.city && props.row.state ? ', ' : ''}{props.row.state || ''}</Typography>
        <Typography>{props.row.teachersEnrolled || 0}</Typography>
        <Typography>{props.row.studentsEnrolled || 0}</Typography>
        {HandleBtnRender(props, "right")}<br/>
      </div>
    ),
  },
];
