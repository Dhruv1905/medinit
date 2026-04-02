import { useAuth } from "../context/Authcontext";
import PatientHome from "./dashboards/PatientHome";
import DoctorHome from "./dashboards/DoctorHome";
import NurseHome from "./dashboards/NurseHome";
import PharmacistHome from "./dashboards/PharmacistHome";
import AdminHome from "./dashboards/AdminHome";

const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "student":
    case "faculty":
      return <PatientHome />;
    case "doctor":
      return <DoctorHome />;
    case "nurse":
      return <NurseHome />;
    case "pharmacist":
      return <PharmacistHome />;
    case "admin":
      return <AdminHome />;
    default:
      return <PatientHome />;
  }
};

export default Dashboard;