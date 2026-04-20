import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getAllUsers,
  getUserStats,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  createUser,
} from "../../services/userService";
import { useRealtime } from "../../hooks/useRealtime";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  instituteId: string;
  phone?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

const roles = [
  { value: "", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "admin", label: "Admin" },
];

const roleColors: Record<string, string> = {
  student: "#3B82F6",
  faculty: "#06B6D4",
  doctor: "#10B981",
  nurse: "#F59E0B",
  pharmacist: "#8B5CF6",
  admin: "#EF4444",
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Role edit dialog
  const [roleDialog, setRoleDialog] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");

  // Add User dialog
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "", instituteId: "" });
  const [newUserPicture, setNewUserPicture] = useState<File | null>(null);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<User | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const [usersRes, statsRes] = await Promise.all([
        getAllUsers(params),
        getUserStats(),
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data.stats);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("user-update", fetchData);

  useEffect(() => {
    fetchData();
  }, [roleFilter, statusFilter]);

  const handleSearch = () => fetchData();

  const handleRoleUpdate = async () => {
    if (!roleDialog || !newRole) return;
    try {
      await updateUserRole(roleDialog._id, newRole);
      setRoleDialog(null);
      fetchData();
    } catch {
      setError("Failed to update role");
    }
  };

  const handleAddUser = async () => {
    try {
      if (newUserPicture) {
        const formData = new FormData();
        formData.append("name", newUser.name);
        formData.append("email", newUser.email);
        formData.append("password", newUser.password);
        formData.append("instituteId", newUser.instituteId);
        if (newUser.role) formData.append("role", newUser.role);
        formData.append("profilePicture", newUserPicture);
        await createUser(formData);
      } else {
        await createUser(newUser);
      }
      setAddUserDialog(false);
      setNewUser({ name: "", email: "", password: "", role: "", instituteId: "" });
      setNewUserPicture(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors || "Failed to create user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user._id);
      fetchData();
    } catch {
      setError("Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await deleteUser(deleteDialog._id);
      setDeleteDialog(null);
      fetchData();
    } catch {
      setError("Failed to delete user");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>User Management</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage user accounts, roles, and access
      </Typography>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #3B82F6, #60A5FA)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <PeopleIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{stats.total}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Users</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #10B981, #34D399)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <CheckCircleIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="success.main">{stats.active}</Typography>
                  <Typography variant="caption" color="text.secondary">Active</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #EF4444, #F87171)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <PersonOffIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="error.main">{stats.inactive}</Typography>
                  <Typography variant="caption" color="text.secondary">Inactive</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>BY ROLE</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                  {Object.entries(stats.byRole).map(([role, count]) => (
                    <Chip
                      key={role}
                      label={`${role}: ${count}`}
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        bgcolor: (roleColors[role] || "#9E9E9E") + "18",
                        color: roleColors[role] || "#9E9E9E",
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField size="small" select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ width: 150 }}>
            {roles.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </TextField>
          <TextField size="small" select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ width: 140 }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <RefreshIcon sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={() => setAddUserDialog(true)} sx={{ borderRadius: 2, background: "linear-gradient(135deg, #3B82F6, #60A5FA)" }}>
            + Add User
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Table */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>
      ) : users.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">No users found</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 15px rgba(0,0,0,0.04)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(255, 255, 255, 0.12)" }}>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Institute ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" }, opacity: user.isActive ? 1 : 0.6 }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : undefined}
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          background: user.profilePicture ? "transparent" : `linear-gradient(135deg, ${roleColors[user.role] || "#9E9E9E"}, ${roleColors[user.role] || "#9E9E9E"}99)`,
                        }}
                      >
                        {!user.profilePicture && user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.instituteId}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        bgcolor: (roleColors[user.role] || "#9E9E9E") + "18",
                        color: roleColors[user.role] || "#9E9E9E",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={user.isActive ? "success" : "default"}
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <Tooltip title="Change Role">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setRoleDialog(user);
                            setNewRole(user.role);
                          }}
                          sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                        >
                          <EditIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? "Deactivate" : "Activate"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(user)}
                          sx={{ bgcolor: user.isActive ? "#FFF3E0" : "#E8F5E9" }}
                        >
                          {user.isActive ? (
                            <BlockIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
                          ) : (
                            <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteDialog(user)} sx={{ bgcolor: "#FFEBEE" }}>
                          <DeleteIcon sx={{ fontSize: 18, color: "error.main" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Role Dialog */}
      <Dialog open={!!roleDialog} onClose={() => setRoleDialog(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Change User Role</DialogTitle>
        <DialogContent>
          {roleDialog && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" mb={2}>
                Changing role for <strong>{roleDialog.name}</strong> ({roleDialog.email})
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>New Role <span style={{ color: "#EF4444" }}>*</span></Typography>
                <TextField
                  select
                  fullWidth
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {roles.filter((r) => r.value).map((r) => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setRoleDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleRoleUpdate}
            variant="contained"
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
              "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
            }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#EF4444" }}>Delete User</DialogTitle>
        <DialogContent>
          {deleteDialog && (
            <Typography variant="body2">
              Are you sure you want to permanently delete <strong>{deleteDialog.name}</strong> ({deleteDialog.email})? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>Delete Permanently</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onClose={() => setAddUserDialog(false)} PaperProps={{ sx: { borderRadius: 3, maxWidth: 500, width: "100%" } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Name <span style={{ color: "#EF4444" }}>*</span></Typography>
              <TextField placeholder="Full name" fullWidth value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Institute Email <span style={{ color: "#EF4444" }}>*</span></Typography>
              <TextField type="email" fullWidth placeholder="user@nitw.ac.in" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Institute ID <span style={{ color: "#EF4444" }}>*</span></Typography>
              <TextField placeholder="e.g. CS22B1234" fullWidth value={newUser.instituteId} onChange={(e) => setNewUser({ ...newUser, instituteId: e.target.value })} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Password <span style={{ color: "#EF4444" }}>*</span></Typography>
              <TextField type="password" fullWidth placeholder="Min 8 characters" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Role</Typography>
              <TextField select fullWidth value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                {roles.filter((r) => r.value).map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} sx={{ color: "rgba(255,255,255,0.9)" }}>Profile Picture (optional)</Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ borderRadius: 2, textTransform: "none", borderStyle: "dashed", py: 1.5 }}
              >
                {newUserPicture ? newUserPicture.name : "Choose Image..."}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => setNewUserPicture(e.target.files?.[0] || null)}
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setAddUserDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" sx={{ borderRadius: 2, background: "linear-gradient(135deg, #3B82F6, #60A5FA)" }}>Create User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;