import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StatCard = ({ title, value, icon, color, subtext, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
          )}
          {subtext && (
            <Typography variant="caption" color="textSecondary">
              {subtext}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsTab = ({ accessToken, userRole }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [accessToken]);

  // FIX for Issue #112: Enhanced error handling and logging
  const fetchAnalytics = async () => {
    setLoading(true);
    console.log('AnalyticsTab: Fetching analytics...');
    try {
      console.log('AnalyticsTab: Calling endpoint', `${BACKEND_URL}/api/admin/analytics`);
      const response = await axios.get(`${BACKEND_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('AnalyticsTab: Response received:', response.data);
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      // FIX: Show more detailed error message
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load analytics';
      setError(`Failed to load analytics: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    // FIX for Issue #112: Better error display with retry
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 3, bgcolor: '#fff3e0' }}>
          <Typography color="error" variant="h6" gutterBottom>
            Analytics Error
          </Typography>
          <Typography color="error" paragraph>{error}</Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <button 
              onClick={fetchAnalytics}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
            <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center' }}>
              Check console for details
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  const data = analytics || {};

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Real-Time Analytics Dashboard
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Schools"
            value={data.totalSchools || 0}
            icon={<SchoolIcon />}
            color="#9c27b0"
            subtext={`${data.activeSchools || 0} active`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Teachers"
            value={data.totalTeachers || 0}
            icon={<PersonIcon />}
            color="#2196f3"
            subtext={`Across ${data.schoolsWithTeachers || 0} schools`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={data.totalStudents || 0}
            icon={<PeopleIcon />}
            color="#4caf50"
            subtext={`${data.activeStudents || 0} active`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Downloads"
            value={data.totalDownloads || 0}
            icon={<DownloadIcon />}
            color="#ff9800"
            subtext={`${data.downloadsToday || 0} today`}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Usage Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Usage Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Image Credits Used</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data.totalCreditsUsed || 0}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((data.totalCreditsUsed || 0) / (data.totalCreditsAllocated || 1) * 100, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Images Generated This Month</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data.imagesThisMonth || 0}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Active Users (Last 7 Days)</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data.activeUsersLast7Days || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Registrations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              {(data.recentRegistrations || []).slice(0, 5).map((user, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: user.role === 'TEACHER' ? '#2196f3' : '#4caf50' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <>
                        <Chip label={user.role} size="small" sx={{ mr: 1 }} />
                        {new Date(user.created_at).toLocaleDateString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
              {(!data.recentRegistrations || data.recentRegistrations.length === 0) && (
                <ListItem>
                  <ListItemText secondary="No recent registrations" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* School-wise Statistics */}
      {userRole === 'SUPER_ADMIN' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            School-wise Statistics
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>School</strong></TableCell>
                  <TableCell align="center"><strong>Teachers</strong></TableCell>
                  <TableCell align="center"><strong>Students</strong></TableCell>
                  <TableCell align="center"><strong>Downloads</strong></TableCell>
                  <TableCell align="center"><strong>Credits Used</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.schoolStats || []).map((school, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{school.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{school.code}</Typography>
                    </TableCell>
                    <TableCell align="center">{school.teacherCount || 0}</TableCell>
                    <TableCell align="center">{school.studentCount || 0}</TableCell>
                    <TableCell align="center">{school.downloadCount || 0}</TableCell>
                    <TableCell align="center">{school.creditsUsed || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={school.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={school.isActive ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!data.schoolStats || data.schoolStats.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No school data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AnalyticsTab;
