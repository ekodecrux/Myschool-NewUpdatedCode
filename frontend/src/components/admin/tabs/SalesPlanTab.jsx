import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon,
  ExpandMore as ExpandMoreIcon,
  MonetizationOn as MoneyIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PLAN_CATEGORIES = [
  { value: 'SCHOOL_ERP', label: 'School ERP' },
  { value: 'AI_TUTOR', label: 'AI Tutor' },
  { value: 'COMPETITIVE_EXAMS', label: 'Competitive Exams' },
  { value: 'BUNDLE', label: 'Bundle Package' }
];

const PLAN_DURATIONS = [
  { value: 'MONTHLY', label: 'Monthly', days: 30 },
  { value: 'QUARTERLY', label: 'Quarterly', days: 90 },
  { value: 'ANNUAL', label: 'Annual', days: 365 },
  { value: 'CUSTOM', label: 'Custom', days: null }
];

const UTILITIES = [
  { key: 'ai_tutor', label: 'AI Tutor' },
  { key: 'lesson_planning', label: 'Lesson Planning' },
  { key: 'assessment_generator', label: 'Assessment Generator' },
  { key: 'image_generator', label: 'Image Generator' },
  { key: 'analytics_reports', label: 'Analytics & Reports' },
  { key: 'parent_portal', label: 'Parent Portal' },
  { key: 'notifications_sms', label: 'SMS Notifications' },
  { key: 'notifications_email', label: 'Email Notifications' },
  { key: 'notifications_whatsapp', label: 'WhatsApp Notifications' },
  { key: 'third_party_integrations', label: 'Third-party Integrations' }
];

const CREDIT_EXHAUSTION_OPTIONS = [
  { value: 'BLOCK', label: 'Block Generation' },
  { value: 'ALLOW_TOPUP', label: 'Allow Paid Top-up' },
  { value: 'SOFT_WARNING', label: 'Soft Warning Only' }
];

const defaultPlanForm = {
  name: '',
  category: 'SCHOOL_ERP',
  status: 'DRAFT',
  duration: 'MONTHLY',
  customDays: 30,
  price: 0,
  monthlyCredits: 100,
  creditCarryForward: false,
  maxCarryForward: 0,
  creditExhaustionHandling: 'BLOCK',
  maxStudents: 100,
  maxTeachers: 10,
  maxClassrooms: 10,
  maxSectionsPerClass: 5,
  enabledUtilities: ['image_generator'],
  autoRenewal: false,
  gracePeriodDays: 7,
  geography: 'GLOBAL',
  description: ''
};

const SalesPlanTab = ({ accessToken }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(defaultPlanForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPlans();
  }, [accessToken]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/sales-plans`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setPlans(response.data.plans || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      showSnackbar('Failed to load sales plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        ...defaultPlanForm,
        ...plan,
        enabledUtilities: plan.enabledUtilities || ['image_generator']
      });
    } else {
      setEditingPlan(null);
      setFormData(defaultPlanForm);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    setFormData(defaultPlanForm);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUtilityToggle = (utilityKey) => {
    setFormData(prev => {
      const current = prev.enabledUtilities || [];
      if (current.includes(utilityKey)) {
        return { ...prev, enabledUtilities: current.filter(u => u !== utilityKey) };
      }
      return { ...prev, enabledUtilities: [...current, utilityKey] };
    });
  };

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const url = editingPlan
        ? `${BACKEND_URL}/api/admin/sales-plans/${editingPlan.id}`
        : `${BACKEND_URL}/api/admin/sales-plans`;
      const method = editingPlan ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      showSnackbar(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
      handleCloseDialog();
      fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      showSnackbar(err.response?.data?.detail || 'Failed to save plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClonePlan = async (plan) => {
    const clonedPlan = {
      ...plan,
      name: `${plan.name} (Copy)`,
      status: 'DRAFT'
    };
    delete clonedPlan.id;
    delete clonedPlan.planCode;
    delete clonedPlan.created_at;

    try {
      await axios.post(`${BACKEND_URL}/api/admin/sales-plans`, clonedPlan, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      showSnackbar('Plan cloned successfully');
      fetchPlans();
    } catch (err) {
      showSnackbar('Failed to clone plan', 'error');
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/sales-plans/${planToDelete.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      showSnackbar('Plan deleted successfully');
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } catch (err) {
      showSnackbar('Failed to delete plan', 'error');
    }
  };

  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await axios.patch(`${BACKEND_URL}/api/admin/sales-plans/${plan.id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      showSnackbar(`Plan ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } catch (err) {
      showSnackbar('Failed to update status', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = { DRAFT: 'default', ACTIVE: 'success', INACTIVE: 'warning', RETIRED: 'error' };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Sales Plan Configurator</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#ec4899', '&:hover': { bgcolor: '#db2777' } }}
        >
          Create New Plan
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{plans.filter(p => p.status === 'ACTIVE').length}</Typography>
              <Typography variant="caption">Active Plans</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{plans.filter(p => p.status === 'DRAFT').length}</Typography>
              <Typography variant="caption">Draft Plans</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{plans.length}</Typography>
              <Typography variant="caption">Total Plans</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">0</Typography>
              <Typography variant="caption">Active Subscriptions</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Plans Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Plan Name</strong></TableCell>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell align="right"><strong>Price</strong></TableCell>
                <TableCell align="center"><strong>Credits</strong></TableCell>
                <TableCell align="center"><strong>Limits</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No sales plans found. Create your first plan!</TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{plan.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={plan.planCode} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{PLAN_CATEGORIES.find(c => c.value === plan.category)?.label || plan.category}</TableCell>
                    <TableCell>{PLAN_DURATIONS.find(d => d.value === plan.duration)?.label || plan.duration}</TableCell>
                    <TableCell align="right">₹{plan.price?.toLocaleString() || 0}</TableCell>
                    <TableCell align="center">{plan.monthlyCredits || 0}/mo</TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Students: ${plan.maxStudents}, Teachers: ${plan.maxTeachers}`}>
                        <Typography variant="caption">
                          S:{plan.maxStudents} T:{plan.maxTeachers}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={plan.status} 
                        size="small" 
                        color={getStatusColor(plan.status)}
                        onClick={() => handleToggleStatus(plan)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(plan)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Clone">
                        <IconButton size="small" onClick={() => handleClonePlan(plan)}>
                          <CloneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => { setPlanToDelete(plan); setDeleteConfirmOpen(true); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPlan ? 'Edit Sales Plan' : 'Create New Sales Plan'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>Basic Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plan Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  {PLAN_CATEGORIES.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            {/* Duration & Pricing */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Duration & Pricing</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={formData.duration}
                  label="Duration"
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                >
                  {PLAN_DURATIONS.map(dur => (
                    <MenuItem key={dur.value} value={dur.value}>{dur.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.duration === 'CUSTOM' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Custom Days"
                  value={formData.customDays}
                  onChange={(e) => handleFormChange('customDays', parseInt(e.target.value))}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Price (₹)"
                value={formData.price}
                onChange={(e) => handleFormChange('price', parseFloat(e.target.value))}
                InputProps={{ startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>

            {/* Credits Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Image Credits Configuration</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Monthly Credits"
                value={formData.monthlyCredits}
                onChange={(e) => handleFormChange('monthlyCredits', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>On Credit Exhaustion</InputLabel>
                <Select
                  value={formData.creditExhaustionHandling}
                  label="On Credit Exhaustion"
                  onChange={(e) => handleFormChange('creditExhaustionHandling', e.target.value)}
                >
                  {CREDIT_EXHAUSTION_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.creditCarryForward}
                    onChange={(e) => handleFormChange('creditCarryForward', e.target.checked)}
                  />
                }
                label="Credit Carry Forward"
              />
            </Grid>

            {/* Capacity Limits */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Capacity Limits</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Max Students"
                value={formData.maxStudents}
                onChange={(e) => handleFormChange('maxStudents', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Max Teachers"
                value={formData.maxTeachers}
                onChange={(e) => handleFormChange('maxTeachers', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Max Classrooms"
                value={formData.maxClassrooms}
                onChange={(e) => handleFormChange('maxClassrooms', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="number"
                label="Sections/Class"
                value={formData.maxSectionsPerClass}
                onChange={(e) => handleFormChange('maxSectionsPerClass', parseInt(e.target.value))}
              />
            </Grid>

            {/* Utilities Access */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Utilities Access</Typography>
              <FormGroup row>
                {UTILITIES.map(util => (
                  <FormControlLabel
                    key={util.key}
                    control={
                      <Checkbox
                        checked={formData.enabledUtilities?.includes(util.key)}
                        onChange={() => handleUtilityToggle(util.key)}
                        size="small"
                      />
                    }
                    label={util.label}
                    sx={{ width: '33%' }}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Additional Settings */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>Additional Settings</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoRenewal}
                    onChange={(e) => handleFormChange('autoRenewal', e.target.checked)}
                  />
                }
                label="Auto-Renewal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Grace Period (Days)"
                value={formData.gracePeriodDays}
                onChange={(e) => handleFormChange('gracePeriodDays', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Geography</InputLabel>
                <Select
                  value={formData.geography}
                  label="Geography"
                  onChange={(e) => handleFormChange('geography', e.target.value)}
                >
                  <MenuItem value="GLOBAL">Global</MenuItem>
                  <MenuItem value="INDIA">India Only</MenuItem>
                  <MenuItem value="US">US Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSavePlan}
            disabled={saving || !formData.name}
          >
            {saving ? <CircularProgress size={20} /> : (editingPlan ? 'Update Plan' : 'Create Plan')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the plan &quot;{planToDelete?.name}&quot;?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. Existing subscriptions will remain active until expiry.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeletePlan}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesPlanTab;
