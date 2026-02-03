import React, { useRef } from "react";
import MSTextField from "../../../../../customTheme/textField/MSTextField";
import { Button, Typography } from "@mui/material";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useDispatch, useSelector } from "react-redux";
import { RefreshToken } from "../../../../../redux/authSlice";
import { userUploadFile } from "../../../../../redux/uploadFileSlice";
import { useSnackbar } from "../../../../../hook/useSnackbar";
// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
const UploadFile = () => {
    const inputRef = useRef();
    const [preview, setPreview] = React.useState();
    const [previewPdf, setPreviewPdf] = React.useState();
    const [selectedFile, setSelectedFile] = React.useState([]);
    const [isFilePicked, setIsFilePicked] = React.useState(false);
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [pdfError, setPdfError] = React.useState(null); // FIX for Issue #96: Track PDF loading errors
    const { refreshToken, accessToken, userRole } = useSelector((state) => state.login);
    const dispatch = useDispatch()
    const { displaySnackbar } = useSnackbar()
    
    // FIX for Issue #96: Add error handling for PDF loading
    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPdfError(null); // Clear any previous errors
    }
    
    function onDocumentLoadError(error) {
        console.error('Error loading PDF:', error);
        setPdfError('Failed to load PDF preview. The file will still be uploaded.');
    }
    const [fileData, setFileData] = React.useState({
        category: "", tags: "", title: "", file: "", description: ""
    })
    // Sanitize input to prevent XSS and invalid characters
    const sanitizeInput = (value, fieldName) => {
        if (!value) return '';
        
        // Remove potential XSS characters
        let sanitized = value
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/javascript:/gi, '');
        
        // For category and tags, allow only alphanumeric, spaces, commas, hyphens, underscores
        if (fieldName === 'category' || fieldName === 'tags') {
            sanitized = sanitized.replace(/[^a-zA-Z0-9\s,\-_]/g, '');
        }
        
        // For title and description, allow alphanumeric, spaces, and basic punctuation
        if (fieldName === 'title' || fieldName === 'description') {
            sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,!?\-_()'":]/g, '');
        }
        
        return sanitized.trim();
    };
    
    const handleFieldsChange = (e, fieldName) => {
        e.preventDefault()
        const sanitized = sanitizeInput(e.target.value, fieldName);
        setFileData(current => {
            const copy = { ...current }
            copy[fieldName] = sanitized
            return copy
        })
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!fileData.title || !fileData.category || !selectedFile) {
            displaySnackbar({ message: 'Please fill in all required fields', severity: 'error' });
            return;
        }
        
        let header = {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${accessToken}`
        };
        fileData.file = selectedFile
        let uploadData = JsonToFormData(fileData)
        dispatch(userUploadFile({
            headers: header,
            body: uploadData
        })).then((res) => {
            if (res.payload?.success) {
                displaySnackbar({ message: 'Image submitted for approval. Super Admin will review.', severity: 'success' })
                setFileData({
                    category: "", tags: "", title: "", file: "", description: ""
                })
                setPreview()
                setPreviewPdf()
                setIsFilePicked(false);
            } else if (res.payload?.error || res.payload?.detail) {
                displaySnackbar({ message: res.payload?.error || res.payload?.detail || 'Upload failed', severity: 'error' })
            } else if (res.payload?.status === 401 || res.error) {
                header["Content-Type"] = "application/json"
                dispatch(RefreshToken({
                    headers: header,
                    body: {
                        "refreshToken": refreshToken
                    }
                })).then((res) => {
                    header["Content-Type"] = "multipart/form-data"
                    header["Authorization"] = `Bearer ${res.payload.accessToken}`
                    dispatch(userUploadFile({
                        headers: header,
                        body: uploadData
                    })).then((res) => {
                        if (res.payload?.success) {
                            displaySnackbar({ message: 'Image submitted for approval', severity: 'success' })
                            setFileData({
                                category: "", tags: "", title: "", file: "", description: ""
                            })
                            setPreview()
                            setPreviewPdf()
                            setIsFilePicked(false);
                        } else {
                            displaySnackbar({ message: res.payload?.error || 'Upload failed', severity: 'error' })
                        }
                    })
                })
            }
        })
    };
    // Function to convert JSON to FormData
    // @param json object
    // @return formdata
    const JsonToFormData = (item) => {
        let fd = new FormData()
        for (var key in item) {
            fd.append(key, item[key]);
        }
        return fd
    }
    return (
        <div className="myImageUploadImageContainer">
            <div className="myImageEnterTextFieldContainer">
                <MSTextField id="title" type="text" placeholder="Enter image title"
                    label="* Image Title" fieldName="title"
                    value={fileData.title}
                    onChange={handleFieldsChange}
                />
                <MSTextField id="category" type="text" placeholder="Enter category (e.g., ANIMALS, NATURE)"
                    label="* Category" fieldName="category" value={fileData.category}
                    onChange={handleFieldsChange}
                />
                <MSTextField id="description" type="text" placeholder="Enter description (optional)"
                    label="Description" fieldName="description" value={fileData.description}
                    onChange={handleFieldsChange}
                />
                <MSTextField id="tags" type="text" placeholder="Enter tags separated by comma"
                    label="Tags" fieldName="tags" value={fileData.tags}
                    onChange={handleFieldsChange}
                />
                <div className="myImagefileUploadContainer">
                    <Typography fontSize="14px" fontWeight="700">* Select Image File</Typography>
                    <div className="myImageChooseFileContainer">
                        <label htmlFor="file" className="myImageChooseFile">
                            <Typography fontSize="14px">Choose File</Typography>
                            <input
                                id="file"
                                ref={inputRef}
                                type="file"
                                accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    setSelectedFile(e.target.files[0]);
                                    setIsFilePicked(true);
                                    var objectUrl = window.URL.createObjectURL(e.target.files[0])
                                    setPreview(objectUrl);
                                    setPreviewPdf(objectUrl);
                                }}
                                onClick={(e) => { e.target.value = "" }}
                            />
                        </label>
                        {isFilePicked ? selectedFile.name : null}
                    </div>
                </div>
            </div>
            <div className="myImagePreviewContainer">
                <Typography style={{ alignItems: 'center', fontSize: '20px' }}>Preview</Typography>
                {preview ? <div><img src={preview} style={{ maxWidth: '240px' }} alt="Preview" /></div> :
                    <div className="myImagePreviewImageContainer">
                        <Typography style={{ alignItems: 'center' }}>No File Selected </Typography>
                    </div>}
                {/* FIX for Issue #96: Improved PDF preview with error handling */}
                {selectedFile.type === "application/pdf" ? (
                    <div>
                        <Document 
                            file={previewPdf}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={<Typography>Loading PDF...</Typography>}
                        >
                            <Page 
                                width={240} 
                                pageNumber={pageNumber} 
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                        {pdfError && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {pdfError}
                            </Typography>
                        )}
                        {numPages && (
                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                Page {pageNumber} of {numPages}
                            </Typography>
                        )}
                    </div>
                ) : null}
                <div className="myImageSaveBtn">
                    <Button disableElevation className='paymentProceedBtn' variant='contained' onClick={handleSubmit}>Submit for Approval</Button>
                </div>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Note: Submitted images will be reviewed by Super Admin before being added to the library.
                </Typography>
            </div>
        </div>
    )
}
export default UploadFile;