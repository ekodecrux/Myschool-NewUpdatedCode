import * as React from "react";
import { Button, MenuItem, Select, Typography, Card, Box, TextField, Grid, Paper } from "@mui/material";
import home from "../../../../assests/homeScreen/home.png";
import './analytics.css'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { isMobile } from "react-device-detect";
const userRoles = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'School', value: 'SCHOOL' },
    { label: 'Teacher', value: 'TEACHER' },
    { label: 'Student', value: 'STUDENT' },
];
// Simple Date Range Picker Component
const SimpleDateRangePicker = ({ startDate, endDate, onChange }) => {
    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
                type="date"
                label="Start Date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onChange({ startDate: new Date(e.target.value), endDate })}
                InputLabelProps={{ shrink: true }}
                size="small"
            />
            <ArrowRightAltIcon />
            <TextField
                type="date"
                label="End Date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onChange({ startDate, endDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                size="small"
            />
        </Box>
    );
};
// Simple Chart Component (placeholder)
const SimpleChart = ({ data, title }) => {
    const maxValue = Math.max(...data);
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 100 }}>
                {data.map((value, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            flex: 1,
                            bgcolor: 'primary.main',
                            height: `${(value / maxValue) * 100}%`,
                            borderRadius: '4px 4px 0 0',
                            minHeight: 4
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};
const Analytics = () => {
    const [selectionRange, setSelectionRange] = React.useState({
        startDate: new Date(),
        endDate: new Date(),
    });
    const [selectedRole, setSelectedRole] = React.useState('ADMIN');
    // Sample data for charts
    const uploadsData = [30, 45, 60, 40, 55, 70, 65, 80, 75, 90, 85, 95];
    const downloadsData = [20, 35, 50, 30, 45, 60, 55, 70, 65, 80, 75, 85];
    const usersData = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    const handleDateChange = (range) => {
        setSelectionRange(range);
    };
    return (
        <Box className="analyticsContainer" sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
            {/* Filters Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <SimpleDateRangePicker
                            startDate={selectionRange.startDate}
                            endDate={selectionRange.endDate}
                            onChange={handleDateChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Select
                            fullWidth
                            size="small"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {userRoles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button variant="contained" fullWidth>
                            Apply Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Total Users</Typography>
                        <Typography variant="h4">1,234</Typography>
                        <Typography variant="caption" color="success.main">+12% from last month</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Total Uploads</Typography>
                        <Typography variant="h4">5,678</Typography>
                        <Typography variant="caption" color="success.main">+8% from last month</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Total Downloads</Typography>
                        <Typography variant="h4">3,456</Typography>
                        <Typography variant="caption" color="warning.main">+3% from last month</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Active Sessions</Typography>
                        <Typography variant="h4">234</Typography>
                        <Typography variant="caption" color="info.main">Current</Typography>
                    </Card>
                </Grid>
            </Grid>
            {/* Charts Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <SimpleChart data={uploadsData} title="Monthly Uploads" />
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <SimpleChart data={downloadsData} title="Monthly Downloads" />
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <SimpleChart data={usersData} title="User Growth" />
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
export default Analytics;
