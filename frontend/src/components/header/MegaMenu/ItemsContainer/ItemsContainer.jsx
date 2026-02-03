import { Link, Typography } from '@mui/material'
import React from 'react'
import "./ItemsContainer.css"
import { useDispatch, useSelector } from "react-redux";
import { loadImages } from '../../../../redux/apiSlice';
import { isMobile } from 'react-device-detect';
// import { useEffect } from 'react';
const ItemsContainer = (props) => {
    const dispatch = useDispatch()
    const handleFetchData = (child) => {
        let path = props.getPrevPath()
        typeof (child) !== "object" ? path = path + `/${props.parent}/${child}/` : path = path + `/${props.parent}/`
        path = path.split('/').filter((ele) => ele)
        path.splice(1, 0, 'thumbnails')
        path = path.join('/')
        path = path + "/"
        let header = {
            "Content-Type": "application/json"
        }
        dispatch(loadImages({
            url: "/rest/images/fetch",
            header: header,
            method: "post",
            body: { folderPath: path.replace('All/', ''), imagesPerPage: 50 }
        }));
    }
    return (
        <div className="mmItemContainer" onClick={isMobile ? () => props?.mobileDrawer(false) : undefined}>
            <div onClick={handleFetchData} style={{ minHeight: 33 }}>
                <Typography
                    fontSize={isMobile ? 18 : 22}
                    className={'cursorPointer itemsHeading'}
                    color={isMobile ? '#B0CEFE' : 'inherit'}
                    fontFamily={"Roboto"}
                    textTransform={'capitalize'}
                    fontWeight={300}>{props.heading === null ? " " : props.heading.toLowerCase()}</Typography>
            </div>
            <div className='mmItemContainerList'>
                {props?.data?.map((ck, ci) => {
                    if (ck.type !== "file") return (
                        <div key={ck?.title} className={ck.children?.length >= 2 ? 'yellowBackground' : 'mmItemContainerOrderList'} onClick={() => handleFetchData(ck?.title.toUpperCase())}>
                            <Typography className='mmItemContainerLink cursorPointer'>{ck?.title.toLowerCase()}</Typography>
                        </div>
                    )
                }
                )}
            </div>
        </div>
    )
}
export default ItemsContainer