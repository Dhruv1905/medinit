import { useState, useRef } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const roleColors: Record<string, string> = {
  student: "#3B82F6",
  faculty: "#06B6D4",
  doctor: "#10B981",
  nurse: "#F59E0B",
  pharmacist: "#8B5CF6",
  admin: "#EF4444",
};

const Profile = () => {
  let authData;
  try {
    authData = useAuth();
  } catch {
    return null;
  }
  const { user, updateUser } = authData;

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    bloodGroup: "",
    allergies: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpdate = async () => {
    setProfileError("");
    setProfileSuccess("");
    setSaving(true);
    try {
      const data: any = { name: form.name };
      if (form.phone) data.phone = form.phone;
      if (form.bloodGroup) data.bloodGroup = form.bloodGroup;
      if (form.allergies) data.allergies = form.allergies.split(",").map((a: string) => a.trim()).filter(Boolean);

      const res = await api.put("/auth/profile", data);
      updateUser(res.data.user);
      setProfileSuccess("Profile updated successfully");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image must be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    setProfileError("");
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await api.post("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data.user);
      setProfileSuccess("Profile picture updated!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Failed to upload picture");
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  const roleColor = roleColors[user.role] || "#3B82F6";
  const profilePicUrl = user.profilePicture
    ? `http://localhost:5000${user.profilePicture}`
    : undefined;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: "'Outfit', sans-serif" }}>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage your personal information and security
      </Typography>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="animate-fade-in">
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              {/* Profile picture with upload overlay */}
              <Box
                sx={{
                  position: "relative",
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Avatar
                  src={profilePicUrl}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    background: profilePicUrl
                      ? "transparent"
                      : `linear-gradient(135deg, ${roleColor}, ${roleColor}99)`,
                    boxShadow: `0 8px 24px ${roleColor}40`,
                    border: "3px solid white",
                  }}
                >
                  {!profilePicUrl && user.name.charAt(0).toUpperCase()}
                </Avatar>

                {/* Camera overlay button */}
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPicture}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 34,
                    height: 34,
                    bgcolor: "primary.main",
                    color: "white",
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  {uploadingPicture ? (
                    <CircularProgress size={16} sx={{ color: "white" }} />
                  ) : (
                    <CameraAltIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={handleProfilePictureUpload}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontSize: "0.7rem" }}>
                Click the camera icon to change photo
              </Typography>

              <Typography variant="h6" fontWeight={700} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                {user.name}
              </Typography>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                size="small"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  bgcolor: `${roleColor}15`,
                  color: roleColor,
                  border: `1px solid ${roleColor}25`,
                }}
              />

              <Divider sx={{ my: 3, borderColor: "rgba(59, 130, 246, 0.08)" }} />

              <Box sx={{ textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: "rgba(59, 130, 246, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.email}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: "rgba(59, 130, 246, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BadgeIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Institute ID</Typography>
                    <Typography variant="body2" fontWeight={500}>{user.instituteId}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: "rgba(59, 130, 246, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Role</Typography>
                    <Typography variant="body2" fontWeight={500} textTransform="capitalize">{user.role}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit profile + Change password */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Edit Profile */}
          <Card sx={{ mb: 3 }} className="animate-fade-in stagger-1">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2.5} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                Edit Profile
              </Typography>

              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Blood Group"
                    fullWidth
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    placeholder="e.g. O+"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Allergies (comma separated)"
                    fullWidth
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Dust"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : <SaveIcon />}
                  onClick={handleProfileUpdate}
                  disabled={saving || !form.name}
                  sx={{
                    background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                    "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="animate-fade-in stagger-2">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: "rgba(245, 158, 11, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LockIcon sx={{ color: "#F59E0B", fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                  Change Password
                </Typography>
              </Box>

              {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={changingPassword ? <CircularProgress size={18} sx={{ color: "white" }} /> : <LockIcon />}
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  sx={{
                    background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                    "&:hover": { background: "linear-gradient(135deg, #D97706, #F59E0B)" },
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;