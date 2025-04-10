// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Common/Navbar';
import FacilityList from './components/Facilities/FacilityList';
import FacilityDetail from './components/Facilities/FacilityDetail';
import ReservationForm from './components/Reservations/ReservationForm';
import MyReservations from './components/Reservations/MyReservations';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);
  
  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/facilities" element={<FacilityList />} />
          <Route path="/facilities/:facilityId" element={<FacilityDetail />} />
          <Route 
            path="/reserve/:facilityId" 
            element={
              <ProtectedRoute>
                <ReservationForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-reservations" 
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/facilities" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;