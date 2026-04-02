import { useState, useEffect } from "react";
import { useAuth } from "../../context/Authcontext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import EmergencyIcon from "@mui/icons-material/Emergency";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  reportEmergency,
  getMyEmergencies,
  getActiveEmergencies,
  updateEmergency,
} from "../../services/emergencyService";
import { getDoctors } from "../../services/appointmentService";
import { useRealtime } from "../../hooks/useRealtime";
interface Emergency {
  _id: string;
  patient: { _id: string; name: string; email: string; instituteId: string; phone?: string; bloodGroup?: string; allergies?: string[] };
  reportedBy: { name: string };
  assignedDoctor?: { _id: string; name: string };
  assignedNurse?: { _id: string; name: string };
  severity: string;
  status: string;
  description: string;
  location: string;
  vitals?: { bloodPressure?: string; temperature?: number; pulse?: number; spo2?: number };
  actions: { action: string; performedBy: { name: string }; timestamp: string }[];
  diagnosis?: string;
  treatment?: string;
  referralNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface Doctor {
  _id: string;
  name: string;
}

const severityConfig: Record<string, { color: "error" | "warning" | "info"; label: string; bg: string }> = {
  critical: { color: "error", label: "CRITICAL", bg: "#FFEBEE" },
  high: { color: "warning", label: "HIGH", bg: "#FFF3E0" },
  medium: { color: "info", label: "MEDIUM", bg: "#E3F2FD" },
};

const statusSteps = ["reported", "responding", "in_treatment", "resolved"];
const statusLabels: Record<string, string> = {
  reported: "Reported",
  responding: "Responding",
  in_treatment: "In Treatment",
  referred: "Referred",
  resolved: "Resolved",
};

const EmergencyPage = () => {
  const { user } = useAuth();
  const isStaff = ["doctor", "nurse", "admin"].includes(user?.role || "");

  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Report dialog
  const [reportOpen, setReportOpen] = useState(false);
  const [form, setForm] = useState({ severity: "high", description: "", location: "" });
  const [saving, setSaving] = useState(false);

  // Update dialog (staff only)
  const [updateDialog, setUpdateDialog] = useState<Emergency | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    assignedDoctor: "",
    actionNote: "",
    diagnosis: "",
    treatment: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = isStaff ? await getActiveEmergencies() : await getMyEmergencies();
      setEmergencies(res.data.emergencies);
      if (isStaff) {
        const docRes = await getDoctors();
        setDoctors(docRes.data.doctors);
      }
    } catch {
      setError("Failed to load emergencies");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("certificate-update", fetchData);

  useEffect(() => {
    fetchData();
  }, []);

  const handleReport = async () => {
    setSaving(true);
    try {
      await reportEmergency(form);
      setReportOpen(false);
      setForm({ severity: "high", description: "", location: "" });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to report");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenUpdate = (em: Emergency) => {
    setUpdateDialog(em);
    setUpdateForm({
      status: em.status,
      assignedDoctor: em.assignedDoctor?._id || "",
      actionNote: "",
      diagnosis: em.diagnosis || "",
      treatment: em.treatment || "",
    });
  };

  const handleUpdate = async () => {
    if (!updateDialog) return;
    setSaving(true);
    try {
      const data: any = {};
      if (updateForm.status !== updateDialog.status) data.status = updateForm.status;
      if (updateForm.assignedDoctor) data.assignedDoctor = updateForm.assignedDoctor;
      if (updateForm.actionNote) data.actionNote = updateForm.actionNote;
      if (updateForm.diagnosis) data.diagnosis = updateForm.diagnosis;
      if (updateForm.treatment) data.treatment = updateForm.treatment;

      await updateEmergency(updateDialog._id, data);
      setUpdateDialog(null);
      fetchData();
    } catch {
      setError("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getActiveStep = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {isStaff ? "Emergency Cases" : "Emergency"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isStaff ? "Active emergency cases requiring attention" : "Report and track emergency cases"}
          </Typography>
        </Box>
        {!isStaff && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setReportOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #E53935, #EF5350)",
              "&:hover": { background: "linear-gradient(135deg, #C62828, #E53935)" },
            }}
          >
            Report Emergency
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {emergencies.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <EmergencyIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {isStaff ? "No active emergencies" : "No emergencies reported"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {emergencies.map((em) => (
            <Card
              key={em._id}
              sx={{
                borderLeft: `5px solid ${
                  em.severity === "critical" ? "#E53935"
                  : em.severity === "high" ? "#FB8C00"
                  : "#1B6DA1"
                }`,
                transition: "all 0.2s",
                "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 46,
                        height: 46,
                        bgcolor: severityConfig[em.severity]?.bg || "#EEE",
                        color: em.severity === "critical" ? "#E53935" : em.severity === "high" ? "#FB8C00" : "#1B6DA1",
                        fontWeight: 700,
                      }}
                    >
                      <EmergencyIcon />
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {em.patient.name}
                        </Typography>
                        <Chip
                          icon={<FiberManualRecordIcon sx={{ fontSize: "8px !important" }} />}
                          label={severityConfig[em.severity]?.label}
                          size="small"
                          color={severityConfig[em.severity]?.color}
                          sx={{ fontWeight: 700, fontSize: "0.65rem" }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mt: 0.3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">{em.location}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">{formatTime(em.createdAt)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={statusLabels[em.status] || em.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: em.status === "resolved" ? "#E8F5E9" : "#FFF3E0",
                        color: em.status === "resolved" ? "#43A047" : "#FB8C00",
                      }}
                    />
                    {isStaff && em.status !== "resolved" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenUpdate(em)}
                        sx={{ borderRadius: 2 }}
                      >
                        Manage
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {em.description}
                </Typography>

                {/* Progress stepper */}
                {em.status !== "referred" && (
                  <Stepper activeStep={getActiveStep(em.status)} alternativeLabel sx={{ mb: 2 }}>
                    {statusSteps.map((step) => (
                      <Step key={step}>
                        <StepLabel>
                          <Typography variant="caption">{statusLabels[step]}</Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                )}

                {/* Assigned staff */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {em.assignedDoctor && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Doctor:</strong> Dr. {em.assignedDoctor.name}
                    </Typography>
                  )}
                  {em.assignedNurse && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Nurse:</strong> {em.assignedNurse.name}
                    </Typography>
                  )}
                  {em.patient.bloodGroup && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Blood:</strong> {em.patient.bloodGroup}
                    </Typography>
                  )}
                </Box>

                {/* Action log */}
                {em.actions.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "#F4F7FC", borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block">
                      ACTION LOG
                    </Typography>
                    {em.actions.map((act, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "baseline", mb: 0.5 }}>
                        <FiberManualRecordIcon sx={{ fontSize: 6, color: "primary.main", mt: 0.8 }} />
                        <Typography variant="caption">
                          <strong>{act.performedBy?.name || "System"}</strong>: {act.action}
                          <span style={{ color: "#9E9E9E", marginLeft: 8 }}>{formatTime(act.timestamp)}</span>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>Report Emergency</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Severity"
              select
              fullWidth
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <MenuItem value="critical">Critical — Life threatening</MenuItem>
              <MenuItem value="high">High — Urgent attention needed</MenuItem>
              <MenuItem value="medium">Medium — Needs prompt care</MenuItem>
            </TextField>
            <TextField
              label="Location"
              fullWidth
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Hostel Block A, Room 205"
            />
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the emergency situation in detail..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setReportOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleReport}
            variant="contained"
            disabled={saving || !form.description || !form.location}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #E53935, #EF5350)",
              "&:hover": { background: "linear-gradient(135deg, #C62828, #E53935)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Report Emergency"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Dialog (staff) */}
      <Dialog open={!!updateDialog} onClose={() => setUpdateDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Manage Emergency</DialogTitle>
        <DialogContent>
          {updateDialog && (
            <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ p: 2, bgcolor: "#F4F7FC", borderRadius: 2 }}>
                <Typography variant="body2"><strong>Patient:</strong> {updateDialog.patient.name} ({updateDialog.patient.instituteId})</Typography>
                <Typography variant="body2"><strong>Severity:</strong> {updateDialog.severity.toUpperCase()}</Typography>
                <Typography variant="body2"><strong>Description:</strong> {updateDialog.description}</Typography>
              </Box>

              <TextField
                label="Update Status"
                select
                fullWidth
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
              >
                <MenuItem value="reported">Reported</MenuItem>
                <MenuItem value="responding">Responding</MenuItem>
                <MenuItem value="in_treatment">In Treatment</MenuItem>
                <MenuItem value="referred">Referred</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </TextField>

              <TextField
                label="Assign Doctor"
                select
                fullWidth
                value={updateForm.assignedDoctor}
                onChange={(e) => setUpdateForm({ ...updateForm, assignedDoctor: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {doctors.map((d) => (
                  <MenuItem key={d._id} value={d._id}>Dr. {d.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Action Note"
                fullWidth
                multiline
                rows={2}
                value={updateForm.actionNote}
                onChange={(e) => setUpdateForm({ ...updateForm, actionNote: e.target.value })}
                placeholder="Log what action was taken..."
              />

              <TextField
                label="Diagnosis"
                fullWidth
                multiline
                rows={2}
                value={updateForm.diagnosis}
                onChange={(e) => setUpdateForm({ ...updateForm, diagnosis: e.target.value })}
              />

              <TextField
                label="Treatment"
                fullWidth
                multiline
                rows={2}
                value={updateForm.treatment}
                onChange={(e) => setUpdateForm({ ...updateForm, treatment: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setUpdateDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)",
              "&:hover": { background: "linear-gradient(135deg, #0E4D73, #1B6DA1)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyPage;