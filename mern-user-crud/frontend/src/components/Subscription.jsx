import { useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        const user = response.data.find(u => u.subscription);
        setPlan(user?.subscription?.plan || 'None');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch subscription');
      }
    };
    fetchSubscription();
  }, []);

  const handleSubscribe = async (selectedPlan) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/subscribe`,
        { plan: selectedPlan },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setPlan(selectedPlan);
    } catch (err) {
      setError(err.response?.data?.error || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6">Your Plan: {plan}</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleSubscribe('Starter')}
          disabled={loading || plan === 'Starter'}
          sx={{ mr: 1 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Starter (10 tickets)'}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubscribe('Growth')}
          disabled={loading || plan === 'Growth'}
          sx={{ mr: 1 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Growth (50 tickets)'}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubscribe('Premium')}
          disabled={loading || plan === 'Premium'}
        >
          {loading ? <CircularProgress size={24} /> : 'Premium (Unlimited)'}
        </Button>
      </Box>
    </Box>
  );
};

export default Subscription;