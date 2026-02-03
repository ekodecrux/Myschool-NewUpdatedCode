import React, { useRef } from "react";
import MSTextField from "../../../../../customTheme/textField/MSTextField";
import { Button, Typography, Alert } from "@mui/material";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useDispatch, useSelector } from "react-redux";
import { RefreshToken } from "../../../../../redux/authSlice";
import { adminUploadFile } from "../../../../../redux/adminUploadSlice";
import { useSnackbar } from "../../../../../hook/useSnackbar";
// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
const AdminUploadFile = () => {
    const inputRef = useRef();
    const [preview, setPreview] = React.useState();
    const [previewPdf, setPreviewPdf] = React.useState();
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [isFilePicked, setIsFilePicked] = React.useState(false);
    const [numPages, setNumPages] = React.useState(null);
    const [pageNumber, setPageNumber] = React.useState(1);
    const [pdfError, setPdfError] = React.useState(null); // FIX for Issue #96: Track PDF loading errors
    const [uploading, setUploading] = React.useState(false);
    const [uploadStatus, setUploadStatus] = React.useState(null);
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
    
    const [adminUploadData, setAdminUploadData] = React.useState({
        title: "",
        category: "",
        folder_path: "",
        description: "",
        tags: ""
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
        if (fieldName === 'category' || fieldName === 'tags' || fieldName === 'folder_path') {
            sanitized = sanitized.replace(/[^a-zA-Z0-9\s,\-_/]/g, '');
        }
        
        // For title and description, allow alphanumeric, spaces, and basic punctuation
        if (fieldName === 'title' || fieldName === 'description') {
            sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,!?\-_()'":]/g, '');
        }
        
        return sanitized.trim();
    };
    
    const handleFieldsChange = (e, fieldName) => {
        const sanitized = sanitizeInput(e.target.value, fieldName);
        setAdminUploadData(current => {
            const copy = { ...current }
            copy[fieldName] = sanitized
            return copy
        })
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            displaySnackbar("Please select a file to upload", "error");
            return;
        }
        
        if (!adminUploadData.category) {
            displaySnackbar("Please enter a category", "error");
            return;
        }
        
        setUploading(true);
        setUploadStatus(null);
        
        let header = {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${accessToken}`
        };
        
        // Create FormData with correct field names
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', adminUploadData.category.toUpperCase());
        formData.append('title', adminUploadData.title || selectedFile.name);
        if (adminUploadData.folder_path) {
            formData.append('folder_path', adminUploadData.folder_path);
        }
        if (adminUploadData.description) {
            formData.append('description', adminUploadData.description);
        }
        if (adminUploadData.tags) {
            formData.append('tags', adminUploadData.tags);
        }
        
        dispatch(adminUploadFile({
            headers: header,
            body: formData
        })).then((res) => {
            setUploading(false);
            if (res.payload?.message) {
                displaySnackbar(res.payload.message, "success");
                setUploadStatus({
                    type: 'success',
                    message: res.payload.message,
                    status: res.payload.status
                });
                // Reset form
                setSelectedFile(null);
                setIsFilePicked(false);
                setPreview(null);
                setPreviewPdf(null);
                setAdminUploadData({
                    title: "",
                    category: "",
                    folder_path: "",
                    description: "",
                    tags: ""
                });
            } else if (res.payload?.detail) {
                displaySnackbar(res.payload.detail, "error");
                setUploadStatus({
                    type: 'error',
                    message: res.payload.detail
                });
            }
        }).catch((err) => {
            setUploading(false);
            displaySnackbar("Upload failed", "error");
            setUploadStatus({
                type: 'error',
                message: "Upload failed: " + (err.message || "Unknown error")
            });
        });
    }
    
    return (
        <div className="myImageUploadImageContainer">
            <div className="myImageEnterTextFieldContainer">
                <MSTextField id="title" type="text" placeholder="Enter file title"
                    label="Title" fieldName="title"
                    value={adminUploadData.title}
                    onChange={handleFieldsChange}
                />
                <MSTextField id="category" type="text" placeholder="Enter category (e.g., ANIMALS, BIRDS)"
                    label="* Category" fieldName="category" value={adminUploadData.category}
                    onChange={handleFieldsChange}
                />
                <MSTextField id="folder_path" type="text" placeholder="Enter folder path (e.g., ACADEMIC/IMAGE BANK)"
                    label="Folder Path" fieldName="folder_path" value={adminUploadData.folder_path}
                    onChange={handleFieldsChange}
                />
                <MSTextField id="tags" type="text" placeholder="Enter tags separated by comma"
                    label="Tags" fieldName="tags" value={adminUploadData.tags}
                    onChange={handleFieldsChange}
                />
                <div className="myImagefileUploadContainer">
                    <Typography fontSize="14px" fontWeight="700">* Select File</Typography>
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
                                    const file = e.target.files[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        setIsFilePicked(true);
                                        var objectUrl = window.URL.createObjectURL(file)
                                        setPreview(objectUrl);
                                        setPreviewPdf(objectUrl);
                                    }
                                }}
                                onClick={(e) => { e.target.value = "" }}
                            />
                        </label>
                        {isFilePicked && selectedFile ? selectedFile.name : "No file selected"}
                    </div>
                </div>
            </div>
            <div className="myImagePreviewContainer">
                <Typography style={{ alignItems: 'center', fontSize: '20px' }}>Preview</Typography>
                {preview && selectedFile?.type?.startsWith('image/') ? 
                    <div><img src={preview} style={{ maxWidth: '240px' }} alt="Preview" /></div> :
                    selectedFile?.type === "application/pdf" ? (
                        /* FIX for Issue #96: Improved PDF preview with error handling */
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
                    ) :
                        <div className="myImagePreviewImageContainer">
                            <Typography style={{ alignItems: 'center' }}>No File Selected</Typography>
                        </div>
                }
                
                {uploadStatus && (
                    <Alert severity={uploadStatus.type} sx={{ mt: 2, mb: 2 }}>
                        {uploadStatus.message}
                        {uploadStatus.status && <strong> (Status: {uploadStatus.status})</strong>}
                    </Alert>
                )}
                
                <div className="myImageSaveBtn">
                    <Button 
                        disableElevation 
                        className='paymentProceedBtn' 
                        variant='contained' 
                        onClick={handleSubmit}
                        disabled={uploading || !selectedFile}
                    >
                        {uploading ? 'Uploading...' : 'Submit'}
                    </Button>
                </div>
                
                {userRole !== 'SUPER_ADMIN' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Note: Your upload will be pending approval by Super Admin
                    </Typography>
                )}
            </div>
        </div>
    )
}
export default AdminUploadFile;