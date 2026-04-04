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
        { label: "Reimbursements", path: "/dashboard/reimbursements", icon: <AssignmentIcon /> },
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
        background: "linear-gradient(180deg, #1E3A5F 0%, #1D4ED8 50%, #3B82F6 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glass orbs */}
      <Box
        sx={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          top: -60,
          right: -60,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          bottom: 80,
          left: -40,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5, zIndex: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
            lineHeight={1.1}
            letterSpacing="0.02em"
            sx={{ fontFamily: "'Outfit', sans-serif" }}
          >
            MediNIT
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: "0.65rem", letterSpacing: "0.1em" }}>
            CLINIC MANAGEMENT
          </Typography>
        </Box>
      </Box>

      {/* Decorative line */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box
          sx={{
            height: 2,
            borderRadius: 2,
            background: "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.02))",
          }}
        />
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 1, overflowY: "auto", zIndex: 1 }}>
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
                bgcolor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                backdropFilter: isActive ? "blur(12px)" : "none",
                border: isActive ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: isActive
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 38, opacity: isActive ? 1 : 0.65 }}>
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
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #60A5FA, white)",
                    boxShadow: "0 0 8px rgba(96,165,250,0.6)",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* User card at bottom */}
      <Box sx={{ p: 2, pt: 1, zIndex: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              fontSize: "0.9rem",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }} noWrap>
              {user.instituteId}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box className="dashboard-bg" sx={{ display: "flex", minHeight: "100vh" }}>
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
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: "text.primary",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
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
                bgcolor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: 3,
                px: 2,
                py: 0.8,
                flex: 1,
                maxWidth: 400,
                transition: "all 0.25s ease",
                "&:focus-within": {
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.08)",
                  bgcolor: "rgba(255, 255, 255, 0.22)",
                },
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
                bgcolor: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            />

            {/* Notification bell */}
            <IconButton
              sx={{
                color: "text.secondary",
                bgcolor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.22)",
                },
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Profile */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
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
                sx: {
                  borderRadius: 3,
                  mt: 1,
                  minWidth: 200,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 16px 48px rgba(31, 38, 135, 0.15)",
                },
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