import { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const Register = ({ setToken, setShowRegister }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setShowRegister(false); // Switch to login after successful registration
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        fullWidth
        margin="normal"
        type="email"
        required
      />
      <TextField
        label="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        fullWidth
        margin="normal"
        type="password"
        required
      />
      <TextField
        label="Age"
        value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })}
        fullWidth
        margin="normal"
        type="number"
        required
      />
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Register'}
      </Button>
    </Box>
  );
};

export default Register;