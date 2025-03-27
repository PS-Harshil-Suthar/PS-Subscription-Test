import { useState, useEffect } from 'react';
import { TextField, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const UserForm = ({ onUserAdded, editUser }) => {
  const [user, setUser] = useState({ name: '', email: '', age: '' });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editUser) {
      setUser(editUser);
      setOpen(true);
    }
  }, [editUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editUser) {
        await axios.put(`${import.meta.env.VITE_API_URL}/users/${editUser._id}`, user, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/users`, user, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
      }
      setUser({ name: '', email: '', age: '' });
      setOpen(false);
      onUserAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New User
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpen(true)}
          sx={{ mb: 2 }}
        >
          Add User
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Age"
            type="number"
            value={user.age}
            onChange={(e) => setUser({ ...user, age: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={editUser ? <EditIcon /> : <PersonAddIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editUser ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserForm;