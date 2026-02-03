import React, { useState } from "react";
import "./Menubar.css";
import {
  InputAdornment,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Autocomplete,
} from "@mui/material";
import { ReactComponent as SearchIcon } from "../../../assests/header/searchIcon.svg";
import AvatarIcon from "../../../assests/header/avatar.svg";
import AvatarBlackIcon from "../../../assests/auth/AvatarBlack.svg";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { logoutUser } from "../../../redux/authSlice";
import { BrowserView, isMobile, MobileView } from "react-device-detect";
import { loadImages } from "../../../redux/apiSlice";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import useDrag from "../../../customTheme/signUpMenu/useDrag";
import { LeftArrow, RightArrow } from "./MenubarArrow";
const Menubar = (props) => {
  const { isLoggedin } = useSelector((state) => state.login);
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState("");
  const opened = Boolean(anchorEl);
  const { dragStart, dragStop, dragMove, dragging } = useDrag();
  const handleDrag = ({ scrollContainer }) => (e) => dragMove(e, (posDiff) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += posDiff;
    }
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileClose = () => {
    setAnchorEl(null);
  };
  const userLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };
  React.useEffect(() => {
    let searchedText = location?.search.replace("?text=", "").toLowerCase();
    // Decode URL-encoded characters like %20 -> space
    try {
      searchedText = decodeURIComponent(searchedText);
    } catch (e) {
      // If decoding fails, use as-is
    }
    // alert(searchedText);
    if (searchedText.includes("?main=")) {
      setSearchText("");
    } else if (searchedText !== "") setSearchText(searchedText);
  }, [location?.search]);
  // Function handling menu bar item selection
  // @param (index of Menubar data)
  const handleMenuBtnPress = (index, menu) => {
    props.handleSelectedMenuItem(index);
  };
  const handleFetchData = (menu) => {
    let path = location.pathname.toUpperCase()
    path = path.split('/').filter(ele => ele).filter(ele => ele !== "VIEWS")
    path.splice(1, 0, 'thumbnails')
    if (menu.title !== 'ALL') {
      path.push(`${menu.title}`)
    } else {
      path = path.split('/').filter(ele => ele).filter(ele => ele !== "VIEWS")
      path.splice(1, 0, 'thumbnails')
    }
    path = path.join('/')
    let header = {
      "Content-Type": "application/json"
    }
    dispatch(loadImages({
      url: "/rest/images/fetch",
      header: header,
      method: "post",
      body: { folderPath: path.replace('/All', '/'), imagesPerPage: 50 }
    }));
  }
  const handleEnterKey = (e) => {
    if (e.keyCode === 13) {
      var path = location.pathname
        .split("/")
        .filter((el) => el)
        .filter((el) => el !== "views")[0];
      if (path === "result") {
        navigate({ pathname: `/views/result`, search: `?text=${searchText}` });
        return;
      }
      navigate({
        pathname: `/views/${path}/result`,
        search: `?text=${searchText}`,
      });
    }
  };
  var path = location.pathname
    .split("/")
    .filter((el) => el)
    .filter((el) => el !== "views");
  return (
    <div
      className="menuBarContainer"
      style={{
        flex: isMobile ? 0.4 : 1,
        maxHeight: isMobile ? "unset" : null,
        display: path[1] === "makers" ? "none" : "flex",
      }}
    >
      {!isMobile ? <div className="menubarHomeGutter" /> : null}
      <nav className={isMobile ? "mobileMenubarNav" : "menubarNav"}>
        {props.active !== 3 ? (
          <ul className={isMobile ? "mobileMenubarItems" : "menubarItems"}>
            <MobileView>
              {props.active !== null &&
                props.data !== null &&
                props.data !== undefined &&
                props?.data.map((menu, index) => {
                  return (
                    <Button
                      className={[
                        "menubarLink",
                        props.selected === index ? "menubarItemsSelected" : null,
                      ].join(" ")}
                      key={index}
                      onClick={() => {
                        handleMenuBtnPress(index, menu)
                        handleFetchData(menu)
                      }}
                    >
                      {menu.title}
                    </Button>
                  );
                })}
            </MobileView>
            <BrowserView>
              <ScrollMenu
                wrapperClassName="subjectScrollWrapper"
                separatorClassName="subjectSeparator"
                scrollContainerClassName='subMenuListScrollContainer'
                onMouseDown={() => dragStart}
                LeftArrow={LeftArrow}
                RightArrow={RightArrow}
                onMouseUp={() => dragStop}
                onMouseMove={handleDrag}
              >
                {props.active !== null &&
                  props.data !== null &&
                  props.data !== undefined &&
                  props?.data.map((menu, index) => {
                    return (
                      <Button
                        className={[
                          "menubarLink",
                          props.selected === index ? "menubarItemsSelected" : null,
                        ].join(" ")}
                        key={index}
                        onClick={() => {
                          handleMenuBtnPress(index, menu)
                          handleFetchData(menu)
                        }}
                      >
                        {menu.title}
                      </Button>
                    );
                  })}
              </ScrollMenu>
            </BrowserView>
          </ul>
        ) : (
          <ul className="menubarItems"> </ul>
        )}
        {!isMobile ? (
          <div className="menubarSearch">
            <TextField
              autoComplete="off"
              onFocus={(e) => e.target.select()}
              className="menubarSearchField"
              placeholder="Search your wish here"
              fullWidth
              size="small"
              value={searchText}
              onKeyDown={handleEnterKey}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                autoComplete: "off",
                startAdornment: (
                  <InputAdornment position="start" className="navSearchIcon">
                    <SearchIcon width={36} height={36} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        ) : null}
        {isLoggedin && !isMobile ? (
          <div className="navWrapper avatarMenubarPosition">
            <div className="profileLogo" style={{ paddingTop: "7px" }}>
              <IconButton
                id="avatarBtn"
                aria-controls={opened ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={opened ? "true" : undefined}
                onClick={handleIconClick}
              >
                <Avatar src={opened ? AvatarBlackIcon : AvatarIcon} />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                open={opened}
                sx={{
                  ".MuiMenu-paper": {
                    minWidth: 213,
                    background:
                      "transparent linear-gradient(180deg, #000000CC 0%, #3D3D3D99 100%) 0% 0% no-repeat padding-box",
                    color: "white",
                  },
                }}
                onClose={handleProfileClose}
                MenuListProps={{
                  "aria-labelledby": "avatarBtn",
                }}
              >
                <MenuItem
                  className="linkTypoProxima"
                  onClick={() => navigate("/auth")}
                >
                  Dashboard
                </MenuItem>
                <MenuItem className="linkTypoProxima" onClick={userLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </div>
          </div>
        ) : (
          ""
        )}
      </nav>
      {!isMobile ? <div className="homeGutter" /> : null}
    </div>
  );
};
export default Menubar;
