import React, { useState, useEffect } from 'react';
import subscriptionIcon from "../../../../../assests/auth/subscriptionIcon.svg";
import "./payment.css";
import { 
    Button, Typography, Box, Card, CardContent, 
    Grid, Paper, Divider, CircularProgress, Alert,
    Chip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useSnackbar } from '../../../../../hook/useSnackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import axios from 'axios';

const Payment = (props) => {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [loading, setLoading] = useState(false);
    const [fetchingPlans, setFetchingPlans] = useState(true);
    const [error, setError] = useState('');
    const { displaySnackbar } = useSnackbar();
    const { accessToken } = useSelector((state) => state.login);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // Fetch subscription plans on mount
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/rest/payments/plans`);
                setPlans(response.data.plans);
                setFetchingPlans(false);
            } catch (err) {
                setError('Failed to load subscription plans');
                setFetchingPlans(false);
                // Fallback plans
                setPlans([
                    { id: 'basic', name: 'Basic Plan', price: 499, credits: 100, features: ['100 Downloads', 'Basic Templates', 'Email Support'] },
                    { id: 'premium', name: 'Premium Plan', price: 999, credits: 500, features: ['500 Downloads', 'All Templates', 'Priority Support', 'No Watermarks'] },
                    { id: 'enterprise', name: 'Enterprise Plan', price: 2499, credits: 2000, features: ['Unlimited Downloads', 'All Features', '24/7 Support', 'Custom Branding', 'API Access'] }
                ]);
            }
        };
        fetchPlans();
    }, [backendUrl]);

    const handlePayment = async () => {
        if (!selectedPlan) {
            displaySnackbar({ message: 'Please select a plan' });
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${backendUrl}/api/rest/payments/create-checkout-session`,
                {
                    plan_type: selectedPlan,
                    success_url: `${window.location.origin}/auth/subscription?payment=success`,
                    cancel_url: `${window.location.origin}/auth/subscription?payment=cancelled`
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );

            if (response.data.url) {
                // Redirect to Stripe Checkout
                window.location.href = response.data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Payment initialization failed.';
            if (errorMsg.includes('Invalid API Key')) {
                setError('Payment gateway is being configured. Please contact support or try again later.');
            } else {
                setError(errorMsg);
            }
            displaySnackbar({ message: 'Payment service temporarily unavailable.' });
            setLoading(false);
        }
    };

    // Check for payment status in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const sessionId = params.get('session_id');

        if (paymentStatus === 'success' && sessionId) {
            // Verify payment
            const verifyPayment = async () => {
                try {
                    const response = await axios.post(
                        `${backendUrl}/api/rest/payments/verify-session`,
                        { sessionId },
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );
                    if (response.data.success) {
                        displaySnackbar({ message: response.data.message });
                    }
                } catch (err) {
                    // Silent fail - payment already processed
                }
            };
            verifyPayment();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'cancelled') {
            displaySnackbar({ message: 'Payment was cancelled' });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [backendUrl, accessToken, displaySnackbar]);

    const getSelectedPlan = () => plans.find(p => p.id === selectedPlan);

    if (fetchingPlans) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="paymentContainer" sx={{ p: 3 }}>
            <Card sx={{ maxWidth: 900, mx: 'auto', mt: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <img src={subscriptionIcon} alt="subscription" style={{ width: 48, height: 48, marginRight: 16 }} />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">Subscription Plans</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose a plan to unlock premium features
                            </Typography>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Subscription Plans */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {plans.map((plan) => (
                            <Grid item xs={12} md={4} key={plan.id}>
                                <Paper 
                                    elevation={selectedPlan === plan.id ? 8 : 1}
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: selectedPlan === plan.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { 
                                            borderColor: '#1976d2',
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    {plan.id === 'premium' && (
                                        <Chip 
                                            label="Most Popular" 
                                            color="primary" 
                                            size="small"
                                            sx={{ 
                                                position: 'absolute', 
                                                top: -12, 
                                                left: '50%', 
                                                transform: 'translateX(-50%)' 
                                            }}
                                        />
                                    )}
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="h3" color="primary" fontWeight="bold">
                                        ₹{plan.price}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {plan.credits} Credits
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ textAlign: 'left' }}>
                                        {plan.features.map((feature, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                                                <Typography variant="body2">{feature}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Selected Plan Summary */}
                    {getSelectedPlan() && (
                        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" color="text.secondary">Selected Plan</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">{getSelectedPlan().name}</Typography>
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    ₹{getSelectedPlan().price}
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {/* Pay Button */}
                    <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        onClick={handlePayment}
                        disabled={loading || !selectedPlan}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CreditCardIcon />}
                        sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                        {loading ? 'Redirecting to Stripe...' : `Pay ₹${getSelectedPlan()?.price || 0}`}
                    </Button>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Secure payment powered by Stripe. Your payment information is encrypted.
                        </Typography>
                    </Box>

                    {/* Cancel Button */}
                    <Button 
                        variant="text" 
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={props.handleCancel}
                    >
                        Cancel
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Payment;
