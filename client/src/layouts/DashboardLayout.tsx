import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  InputBase,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import EmergencyIcon from "@mui/icons-material/Emergency";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const DRAWER_WIDTH = 270;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const getNavItems = (role: string): NavItem[] => {
  const common: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  ];

  switch (role) {
    case "student":
    case "faculty":
      return [
        ...common,
        { label: "Book Appointment", path: "/dashboard/appointments/book", icon: <CalendarMonthIcon /> },
        { label: "My Appointments", path: "/dashboard/appointments", icon: <AssignmentIcon /> },
        { label: "Visit History", path: "/dashboard/history", icon: <HistoryIcon /> },
        { label: "Certificates", path: "/dashboard/certificates", icon: <DescriptionIcon /> },
        { label: "Emergency", path: "/dashboard/emergency", icon: <EmergencyIcon /> },
      ];
    case "doctor":
      return [
        ...common,
        { label: "Patient Queue", path: "/dashboard/queue", icon: <PeopleIcon /> },
        { label: "Consultations", path: "/dashboard/consultations", icon: <MedicalServicesIcon /> },
        { label: "Certificates", path: "/dashboard/certificates", icon: <DescriptionIcon /> },
        { label: "My Schedule", path: "/dashboard/schedule", icon: <CalendarMonthIcon /> },
      ];
    case "nurse":
      return [
        ...common,
        { label: "Triage Queue", path: "/dashboard/triage", icon: <PeopleIcon /> },
        { label: "Record Vitals", path: "/dashboard/vitals", icon: <MedicalServicesIcon /> },
        { label: "Emergency Cases", path: "/dashboard/emergency", icon: <EmergencyIcon /> },
      ];
    case "pharmacist":
      return [
        ...common,
        { label: "Prescriptions", path: "/dashboard/prescriptions", icon: <AssignmentIcon /> },
        { label: "Inventory", path: "/dashboard/inventory", icon: <InventoryIcon /> },
      ];
    case "admin":
      return [
        ...common,
        { label: "User Management", path: "/dashboard/users", icon: <PeopleIcon /> },
        { label: "Appointments", path: "/dashboard/appointments", icon: <CalendarMonthIcon /> },
        { label: "Inventory", path: "/dashboard/inventory", icon: <InventoryIcon /> },
        { label: "Certificates", path: "/dashboard/certificates", icon: <DescriptionIcon /> },
        { label: "Reports", path: "/dashboard/reports", icon: <AssignmentIcon /> },
        { label: "Settings", path: "/dashboard/settings", icon: <SettingsIcon /> },
      ];
    default:
      return common;
  }
};

const roleLabels: Record<string, string> = {
  student: "Student",
  faculty: "Faculty",
  doctor: "Doctor",
  nurse: "Nurse",
  pharmacist: "Pharmacist",
  admin: "Administrator",
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0E4D73 0%, #1B6DA1 40%, #4BA3D8 100%)",
        color: "white",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800} lineHeight={1.1} letterSpacing="0.02em">
            MediNIT
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "0.65rem" }}>
            CLINIC MANAGEMENT
          </Typography>
        </Box>
      </Box>

      {/* Decorative curve */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            height: 3,
            borderRadius: 2,
            background: "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05))",
          }}
        />
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 1, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 3,
                mb: 0.5,
                px: 2,
                py: 1.3,
                bgcolor: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                backdropFilter: isActive ? "blur(10px)" : "none",
                "&:hover": {
                  bgcolor: isActive
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 38, opacity: isActive ? 1 : 0.7 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.88rem",
                  fontWeight: isActive ? 600 : 400,
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "white",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* User card at bottom */}
      <Box sx={{ p: 2, pt: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "rgba(255,255,255,0.25)",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }} noWrap>
              {user.instituteId}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "white",
            color: "text.primary",
            borderBottom: "1px solid #E8EDF2",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Search bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#F4F7FC",
                borderRadius: 3,
                px: 2,
                py: 0.8,
                flex: 1,
                maxWidth: 400,
              }}
            >
              <SearchIcon sx={{ color: "text.secondary", fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder="Search patients, appointments..."
                sx={{ flex: 1, fontSize: "0.85rem" }}
              />
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Role badge */}
            <Chip
              label={roleLabels[user.role] || user.role}
              size="small"
              sx={{
                bgcolor: "#EBF4FA",
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: 2,
              }}
            />

            {/* Notification bell */}
            <IconButton sx={{ color: "text.secondary" }}>
              <NotificationsNoneIcon />
            </IconButton>

            {/* Profile */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: { borderRadius: 3, mt: 1, minWidth: 200, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/dashboard/profile"); }} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.2, color: "error.main" }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
                </ListItemIcon>
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;