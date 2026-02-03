import React from 'react';
import {
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const ImageApprovalsTab = ({ 
  pendingImages,
  onApprove,
  onReject,
  onRefresh // FIX for Issue #100: Add refresh functionality
}) => {
  // FIX for Issue #100: Handle undefined/loading state
  const isLoading = pendingImages === undefined;
  const isEmpty = Array.isArray(pendingImages) && pendingImages.length === 0;
  
  return (
    <Box>
      {/* FIX for Issue #100: Add refresh button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Pending Image Approvals</Typography>
        {onRefresh && (
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
      </Box>
      
      {/* FIX for Issue #100: Show loading state */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isEmpty ? (
        <Alert severity="info">No pending image approvals</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Preview</strong></TableCell>
                <TableCell><strong>Submitted By</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingImages.map((image) => (
                <TableRow key={image.id || image._id}>
                  <TableCell>
                    <img 
                      src={image.url || image.s3_url} 
                      alt="Preview" 
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect fill="%23ddd" width="60" height="60"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                      }}
                    />
                  </TableCell>
                  <TableCell>{image.submittedBy || image.uploaded_by || '-'}</TableCell>
                  <TableCell>{image.category || '-'}</TableCell>
                  <TableCell>
                    {image.createdAt || image.created_at ? 
                      new Date(image.createdAt || image.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      color="success" 
                      onClick={() => onApprove(image.id || image._id)}
                      sx={{ minWidth: 32, mr: 1 }}
                      title="Approve"
                    >
                      <CheckIcon fontSize="small" />
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => onReject(image.id || image._id)}
                      sx={{ minWidth: 32 }}
                      title="Reject"
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ImageApprovalsTab;
