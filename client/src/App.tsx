import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import { SocketProvider } from "./context/SocketContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import BookAppointment from "./pages/appointments/BookAppointment";
import MyAppointments from "./pages/appointments/MyAppointments";
import PatientQueue from "./pages/doctor/PatientQueue";
import DoctorCertificates from "./pages/doctor/DoctorCertificates";
import TriageQueue from "./pages/nurse/TriageQueue";
import Inventory from "./pages/pharmacy/Inventory";
import Prescriptions from "./pages/pharmacy/Prescriptions";
import MyCertificates from "./pages/certificates/MyCertificates";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Reimbursements from "./pages/admin/Reimbursements";
import VisitHistory from "./pages/patient/VisitHistory";
import EmergencyPage from "./pages/emergency/EmergencyPage";
import Profile from "./pages/Profile";

const CertificatesPage = () => {
  const { user } = useAuth();
  if (user?.role === "doctor") return <DoctorCertificates />;
  return <MyCertificates />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />

              {/* Patient */}
              <Route path="appointments/book" element={<BookAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="history" element={<VisitHistory />} />

              {/* Doctor */}
              <Route path="queue" element={<PatientQueue />} />
              <Route path="consultations" element={<PatientQueue />} />
              <Route path="schedule" element={<PatientQueue />} />

              {/* Nurse */}
              <Route path="triage" element={<TriageQueue />} />
              <Route path="vitals" element={<TriageQueue />} />

              {/* Shared */}
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="emergency" element={<EmergencyPage />} />

              {/* Pharmacist */}
              <Route path="prescriptions" element={<Prescriptions />} />

              {/* Admin */}
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reimbursements" element={<Reimbursements />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;