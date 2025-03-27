import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, Typography, CircularProgress, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const UserList = ({ refresh, onUserUpdated }) => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    socket.on('userAdded', (newUser) => setUsers((prev) => [...prev, newUser]));
    socket.on('userUpdated', (updatedUser) =>
      setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)))
    );
    socket.on('userDeleted', (id) => setUsers((prev) => prev.filter((u) => u._id !== id)));

    return () => {
      socket.off('userAdded');
      socket.off('userUpdated');
      socket.off('userDeleted');
    };
  }, [refresh]);

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      onUserUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        User List
      </Typography>
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.age}</TableCell>
              <TableCell>{user.subscription?.plan || 'None'}</TableCell>
              <TableCell>
                <Button
                  startIcon={<EditIcon />}
                  color="primary"
                  onClick={() => setEditUser(user)}
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  color="secondary"
                  onClick={() => handleDelete(user._id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editUser && <UserForm editUser={editUser} onUserAdded={onUserUpdated} />}
    </div>
  );
};

export default UserList;