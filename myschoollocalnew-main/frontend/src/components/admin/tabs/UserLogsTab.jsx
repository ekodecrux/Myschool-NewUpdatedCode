import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Image as ImageIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const getActionIcon = (action) => {
  const icons = {
    'login': <LoginIcon fontSize="small" />,
    'logout': <LogoutIcon fontSize="small" />,
    'download': <DownloadIcon fontSize="small" />,
    'upload': <ImageIcon fontSize="small" />,
    'create_user': <PersonAddIcon fontSize="small" />,
    'edit_user': <EditIcon fontSize="small" />,
    'delete_user': <DeleteIcon fontSize="small" />,
    'settings_change': <SettingsIcon fontSize="small" />
  };
  return icons[action] || <SettingsIcon fontSize="small" />;
};

const getActionColor = (action) => {
  const colors = {
    'login': 'success',
    'logout': 'default',
    'download': 'primary',
    'upload': 'info',
    'create_user': 'success',
    'edit_user': 'warning',
    'delete_user': 'error',
    'settings_change': 'secondary'
  };
  return colors[action] || 'default';
};

const UserLogsTab = ({ accessToken, userRole }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchLogs();
    fetchLogStats();
  }, [accessToken, page, rowsPerPage, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: page * rowsPerPage,
        limit: rowsPerPage
      });
      if (actionFilter !== 'all') {
        params.append('action', actionFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await axios.get(`${BACKEND_URL}/api/admin/user-logs?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setLogs(response.data.logs || []);
      setTotalLogs(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load user logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/user-logs/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching log stats:', err);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Activity Logs
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">{stats.todayLogins || 0}</Typography>
              <Typography variant="caption" color="textSecondary">Logins Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary.main">{stats.todayDownloads || 0}</Typography>
              <Typography variant="caption" color="textSecondary">Downloads Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">{stats.totalActions || 0}</Typography>
              <Typography variant="caption" color="textSecondary">Total Actions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">{stats.activeUsers || 0}</Typography>
              <Typography variant="caption" color="textSecondary">Active Users (24h)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Action Type</InputLabel>
              <Select
                value={actionFilter}
                label="Action Type"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="all">All Actions</MenuItem>
                <MenuItem value="login">Login</MenuItem>
                <MenuItem value="logout">Logout</MenuItem>
                <MenuItem value="download">Download</MenuItem>
                <MenuItem value="upload">Upload</MenuItem>
                <MenuItem value="create_user">User Created</MenuItem>
                <MenuItem value="edit_user">User Edited</MenuItem>
                <MenuItem value="delete_user">User Deleted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Tooltip title="Refresh">
              <IconButton onClick={() => { fetchLogs(); fetchLogStats(); }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
                <TableCell><strong>IP Address</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={log.id || index} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {log.userName || log.user_name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log.userEmail || log.user_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={log.userRole || log.user_role || 'N/A'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(log.action)}
                        label={log.action?.replace('_', ' ')?.toUpperCase()}
                        size="small"
                        color={getActionColor(log.action)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {log.ipAddress || log.ip_address || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalLogs}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default UserLogsTab;
