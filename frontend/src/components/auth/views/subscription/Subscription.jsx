import React, { useEffect, useState } from "react";
import { Button, Card, Typography, Alert, Box } from "@mui/material";
import EastIcon from "@mui/icons-material/East";
import { Data } from "./constant";
import "./Subscription.css";
import subscriptionIcon from "../../../../assests/auth/subscriptionIcon.svg";
import subfirst from "../../../../assests/auth/subfirst.png";
import subThird from "../../../../assests/auth/subThird.png";
import subfour from "../../../../assests/auth/subfour.png";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from './Tableconstant';
import Payment from "./payment/payment";
import { useSelector, useDispatch } from "react-redux";
import { MyProfile } from "../../../../redux/myProfileSlice";
import { RefreshToken } from "../../../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//  import {useSelector } from "react-redux";
import { ListUsers } from "../../../../redux/fetchUsersSlice"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
const Subscription = () => {
  const [subscription, setSubscription] = React.useState({});
  const [payment, setPayment] = React.useState(false);
  const [userData, setUserData] = React.useState({});
  const [canAccess, setCanAccess] = useState(null); // null = loading, true/false = result
  const [accessMessage, setAccessMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refreshToken, accessToken, tokenExpiry, userRole ,usersList} = useSelector(
    (state) => state.login,
  );
  
  // Check if user can access subscription page
  useEffect(() => {
    const checkAccess = async () => {
      if (!accessToken) return;
      try {
        const response = await axios.get(`${BACKEND_URL}/api/rest/users/checkCredits`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.data.canAccessSubscription) {
          setCanAccess(true);
        } else {
          setCanAccess(false);
          if (response.data.isUnlimited) {
            setAccessMessage("Super Admins have unlimited credits. Use the Analytics dashboard to view payment and credit statistics.");
          } else {
            setAccessMessage("Subscription is managed by your School Admin. Please contact them for credit requests.");
          }
        }
      } catch (e) {
        console.error("Error checking subscription access:", e);
        setCanAccess(false);
        setAccessMessage("Unable to verify access. Please try again later.");
      }
    };
    checkAccess();
  }, [accessToken]);
  
  // const {hasMore, usersList, loading} = useSelector((state) => state.usersList)
  const handlePayment = (amount, name) => {
    setSubscription({ amount: amount, name: name });
    handleFetchUserDetails();
  };
  const handleFetchUserDetails = () => {
    let header = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    let data = {};
    dispatch(
      MyProfile({
        headers: header,
        method: "GET",
        body: data,
      })
    ).then((res) => {
      if (res.payload.message === "Expired JWT") {
        dispatch(
          RefreshToken({
            headers: header,
            body: {
              refreshToken: refreshToken,
            },
          })
        ).then((res) => {
          header["Authorization"] = `Bearer ${res.payload.accessToken}`;
          dispatch(
            MyProfile({
              headers: header,
              method: "GET",
              body: data,
            })
          ).then((res) => {
            setUserData(res.payload);
          });
        });
      } else {
        setUserData(res.payload);
        setPayment(true);
      }
    });
  };
  
  // Show loading state
  if (canAccess === null) {
    return (
      <div className="subscriptionpageMainContainer">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </div>
    );
  }
  
  // Show access denied message for unauthorized users
  if (canAccess === false) {
    return (
      <div className="subscriptionpageMainContainer">
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Subscription Not Available</Typography>
            <Typography>{accessMessage}</Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/auth')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </div>
    );
  }
  
  if (payment) {
    return (
      <div className="subscriptionpageMainContainer" style={{ gap: 0 }}>
        <Payment
          subscription={subscription}
          userData={userData}
          handleCancel={() => {
            setSubscription({});
            setPayment(false);
          }}
        />
      </div>
    );
  }
  return (
    <div style={{display:'flex',flexDirection:'column'}}>
    <div className="subscriptionpageMainContainer">
      <div className="homeGutter" style={{ maxWidth: 20 }} />
      <div className="subscriptionContainer">
        <div className="subscriptionTxtContainer">
          <img src={subscriptionIcon} alt="" />
          <h2 className="SubscriptionTopHeading">Choose Your Subscription</h2>
        </div>
        <div className="subscriptionImageConatiner">
          <Card className="monthalySubscriptionCard">
            <Typography fontSize="20px">Monthly Subscription</Typography>
            <br />
            <Typography fontSize="20px">499 INR</Typography>
            <div className="subscriptionBtnImgContainer">
              <Button
                sx={{
                  backgroundColor: "#5FCBF3",
                  color: "black",
                  fontWeight: "bold",
                  minWidth: "144px",
                  maxHeight: "35px",
                }}
                endIcon={<EastIcon />}
                onClick={() => handlePayment(499, "Monthly Subscription")}
              >
                Join Now
              </Button>
              <img src={subfirst} className="cardImages" />
            </div>
          </Card>
          <Card className="annualSubscriptionCard">
            <section className="annualSubscriptionBtnTypoContainer">
              <Typography fontSize="20px" border="none">
                Annual subscription
              </Typography>
              <input
                type="button"
                value="Recommended"
                className="recommendedButton"
              />
            </section>
            <br />
            <Typography fontSize="20px">599 INR</Typography>
            <div className="subscriptionBtnImgContainer">
              <Button
                sx={{
                  backgroundColor: "#98D74B",
                  color: "black",
                  fontWeight: "bold",
                  minWidth: "144px",
                  maxHeight: "35px",
                }}
                onClick={() => handlePayment(599, "Annual Subscription")}
                endIcon={<EastIcon />}
              >
                Join Now
              </Button>
              <img src={subThird} className="cardImages" />
            </div>
          </Card>
          <Card className="biannualSubscription">
            <Typography fontSize="20px">Biannual subscription</Typography>
            <br />
            <Typography fontSize="20px">999 INR</Typography>
            <div className="subscriptionBtnImgContainer">
              <Button
                sx={{
                  backgroundColor: "#F1564A",
                  color: "black",
                  fontWeight: "bold",
                  minWidth: "144px",
                  maxHeight: "35px",
                }}
                endIcon={<EastIcon />}
                onClick={() => handlePayment(999, "Biannual Subscription")}
              >
                Join Now
              </Button>
              <img src={subfour} className="cardImages" />
            </div>
          </Card>
        </div>
        <div className="textContainer">
          <h2 fontSize="20px" className="headingSubscription">
            The One-Stop Learning Resource
          </h2>
          <h4 className="aboutSubscription">
            With MySchool membership, you get all this and a community of
            teachers, home schoolers, and <br />
            parents who share a common goal -- inspiring the next generation of
            learners.
          </h4>
        </div>
        <div className="renderCardMainContainer">
          {Data.map((item, index) => (
            <Card className="renderCard" key={index}>
              <Typography
                className="insideCardText"
                fontSize="21px"
                paddingTop="20px"
                paddingLeft="12px"
                paddingBottom="20px"
              >
                {<img src={item.image} className="starImage" />} {item.tittle}
              </Typography>
            </Card>
          ))}
        </div>
        <div className="tableContainer">
        <DataGrid
          getRowId={(row) => row.userId}
          columns={columns}
          rows={[]}
          style={{ backgroundColor: 'white', marginTop:30 }}
          sx={{
            '& .MuiDataGrid-columnHeadersInner': {
              background: "#B3DAFF",
              fontFamily: "Proxima Nova",
              fontWeight: 'bold',
              fontSize: 15,
              fontWeight: 600,
            },
            '.MuiDataGrid-columnSeparator': {
              display: 'none',
            },
          }}
          getRowClassName={() => 'textFontProxima'}
        // rowsPerPageOptions={[20]}
        />
        </div>
      </div>
      <div className="homeGutter" style={{ maxWidth: 20 }} />
    </div>
    </div>
  );
};
export default Subscription;
