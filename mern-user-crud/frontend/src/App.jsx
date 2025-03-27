import { useState, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import Login from './components/Login';
import Register from './components/Register'; // New component
import Subscription from './components/Subscription';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refresh, setRefresh] = useState(false);
  const [showRegister, setShowRegister] = useState(!token); // Show register by default if no token

  const handleUserChange = () => setRefresh(!refresh);
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setShowRegister(true); // Back to register/login after logout
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User CRUD App
          </Typography>
          {token && <Button color="inherit" onClick={logout}>Logout</Button>}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {!token ? (
          <>
            {showRegister ? (
              <Register setToken={setToken} setShowRegister={setShowRegister} />
            ) : (
              <Login setToken={setToken} setShowRegister={setShowRegister} />
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              {showRegister ? (
                <Button onClick={() => setShowRegister(false)}>Already have an account? Login</Button>
              ) : (
                <Button onClick={() => setShowRegister(true)}>Need an account? Register</Button>
              )}
            </Box>
          </>
        ) : (
          <>
            <Subscription />
            <UserForm onUserAdded={handleUserChange} />
            <UserList refresh={refresh} onUserUpdated={handleUserChange} />
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;