import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import { useRealtime } from "../../hooks/useRealtime";
interface Patient {
  _id: string;
  name: string;
  email: string;
  instituteId: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string[];
}

interface Appointment {
  _id: string;
  patient: Patient;
  date: string;
  timeSlot: string;
  reason: string;
  status: string;
  priority: string;
  queueNumber?: number;
  vitals?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
    spo2?: number;
  };
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

const priorityOrder: Record<string, number> = {
  emergency: 0,
  urgent: 1,
  normal: 2,
};

const PatientQueue = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  // Consultation dialog
  const [consultDialog, setConsultDialog] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [consultNotes, setConsultNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Patient detail dialog
  const [detailDialog, setDetailDialog] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getDoctorAppointments(selectedDate);
      // Sort: emergency first, then urgent, then normal. Within same priority, by queue number
      const sorted = res.data.appointments.sort((a: Appointment, b: Appointment) => {
        const pA = priorityOrder[a.priority] ?? 2;
        const pB = priorityOrder[b.priority] ?? 2;
        if (pA !== pB) return pA - pB;
        return (a.queueNumber || 0) - (b.queueNumber || 0);
      });
      setAppointments(sorted);
    } catch {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("appointment-update", fetchAppointments);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleStartConsultation = async (apt: Appointment) => {
    try {
      await updateAppointmentStatus(apt._id, { status: "in_consultation" });
      fetchAppointments();
    } catch {
      setError("Failed to update status");
    }
  };

  const handleOpenConsult = (apt: Appointment) => {
    setConsultDialog(apt);
    setDiagnosis(apt.diagnosis || "");
    setPrescription(apt.prescription || "");
    setConsultNotes(apt.notes || "");
  };

  const handleCompleteConsultation = async () => {
    if (!consultDialog) return;
    setSaving(true);
    try {
      await updateAppointmentStatus(consultDialog._id, {
        status: "completed",
        diagnosis,
        prescription,
        notes: consultNotes,
      });
      setConsultDialog(null);
      setDiagnosis("");
      setPrescription("");
      setConsultNotes("");
      fetchAppointments();
    } catch {
      setError("Failed to complete consultation");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkNoShow = async (id: string) => {
    try {
      await updateAppointmentStatus(id, { status: "no_show" });
      fetchAppointments();
    } catch {
      setError("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "#1B6DA1";
      case "in_queue": return "#0097A7";
      case "in_consultation": return "#FB8C00";
      case "completed": return "#43A047";
      case "cancelled": return "#E53935";
      case "no_show": return "#9E9E9E";
      default: return "#9E9E9E";
    }
  };

  const statusLabel: Record<string, string> = {
    scheduled: "Scheduled",
    in_queue: "In Queue",
    in_consultation: "In Consultation",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  const activeCount = appointments.filter(
    (a) => !["completed", "cancelled", "no_show"].includes(a.status)
  ).length;

  const completedCount = appointments.filter((a) => a.status === "completed").length;

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Patient Queue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage today's consultations
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAppointments} sx={{ bgcolor: "#EBF4FA" }}>
              <RefreshIcon sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats bar */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {appointments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} color="#FB8C00">
                {activeCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">Active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} color="success.main">
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} color="error.main">
                {appointments.filter((a) => a.priority === "emergency").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Emergency</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <PersonIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No patients for this date
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {appointments.map((apt) => (
            <Card
              key={apt._id}
              sx={{
                transition: "all 0.2s",
                borderLeft: `4px solid ${
                  apt.priority === "emergency"
                    ? "#E53935"
                    : apt.priority === "urgent"
                    ? "#FB8C00"
                    : getStatusColor(apt.status)
                }`,
                opacity: ["completed", "cancelled", "no_show"].includes(apt.status) ? 0.65 : 1,
                "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                  {/* Patient info */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 46,
                        height: 46,
                        background: `linear-gradient(135deg, ${getStatusColor(apt.status)}, ${getStatusColor(apt.status)}99)`,
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {apt.patient.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {apt.patient.name}
                        </Typography>
                        {apt.queueNumber && (
                          <Chip
                            label={`#${apt.queueNumber}`}
                            size="small"
                            sx={{
                              bgcolor: "#EBF4FA",
                              color: "primary.main",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 22,
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {apt.patient.instituteId} • {apt.timeSlot}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {apt.reason}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status + Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {apt.priority !== "normal" && (
                      <Chip
                        icon={<FiberManualRecordIcon sx={{ fontSize: "10px !important" }} />}
                        label={apt.priority.toUpperCase()}
                        size="small"
                        color={apt.priority === "emergency" ? "error" : "warning"}
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                    )}

                    <Chip
                      label={statusLabel[apt.status]}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(apt.status) + "18",
                        color: getStatusColor(apt.status),
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />

                    {/* Action buttons based on status */}
                    {apt.status === "scheduled" && (
                      <>
                        <Tooltip title="Start Consultation">
                          <IconButton
                            onClick={() => handleStartConsultation(apt)}
                            sx={{ bgcolor: "#EBF4FA" }}
                          >
                            <PlayArrowIcon sx={{ color: "primary.main" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark No Show">
                          <IconButton
                            onClick={() => handleMarkNoShow(apt._id)}
                            sx={{ bgcolor: "#FFF3E0" }}
                          >
                            <PersonIcon sx={{ color: "#FB8C00" }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}

                    {apt.status === "in_consultation" && (
                      <Tooltip title="Complete Consultation">
                        <IconButton
                          onClick={() => handleOpenConsult(apt)}
                          sx={{ bgcolor: "#E8F5E9" }}
                        >
                          <CheckCircleIcon sx={{ color: "success.main" }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => setDetailDialog(apt)}
                        sx={{ bgcolor: "#F4F7FC" }}
                      >
                        <VisibilityIcon sx={{ color: "text.secondary" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Vitals row if available */}
                {apt.vitals && Object.keys(apt.vitals).some((k) => (apt.vitals as any)[k]) && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "#F4F7FC",
                      borderRadius: 2,
                      display: "flex",
                      gap: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    {apt.vitals.bloodPressure && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>BP:</strong> {apt.vitals.bloodPressure}
                      </Typography>
                    )}
                    {apt.vitals.temperature && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>Temp:</strong> {apt.vitals.temperature}°F
                      </Typography>
                    )}
                    {apt.vitals.pulse && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>Pulse:</strong> {apt.vitals.pulse} bpm
                      </Typography>
                    )}
                    {apt.vitals.spo2 && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>SpO2:</strong> {apt.vitals.spo2}%
                      </Typography>
                    )}
                    {apt.vitals.weight && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>Weight:</strong> {apt.vitals.weight} kg
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Consultation Dialog */}
      <Dialog
        open={!!consultDialog}
        onClose={() => setConsultDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Complete Consultation
          {consultDialog && (
            <Typography variant="body2" color="text.secondary">
              Patient: {consultDialog.patient.name} ({consultDialog.patient.instituteId})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {consultDialog?.reason && (
              <Box sx={{ p: 2, bgcolor: "#F4F7FC", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  REASON FOR VISIT
                </Typography>
                <Typography variant="body2">{consultDialog.reason}</Typography>
              </Box>
            )}

            {consultDialog?.vitals &&
              Object.keys(consultDialog.vitals).some((k) => (consultDialog.vitals as any)[k]) && (
                <Box sx={{ p: 2, bgcolor: "#F4F7FC", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} mb={1} display="block">
                    VITALS
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {consultDialog.vitals.bloodPressure && (
                      <Typography variant="body2">BP: {consultDialog.vitals.bloodPressure}</Typography>
                    )}
                    {consultDialog.vitals.temperature && (
                      <Typography variant="body2">Temp: {consultDialog.vitals.temperature}°F</Typography>
                    )}
                    {consultDialog.vitals.pulse && (
                      <Typography variant="body2">Pulse: {consultDialog.vitals.pulse} bpm</Typography>
                    )}
                    {consultDialog.vitals.spo2 && (
                      <Typography variant="body2">SpO2: {consultDialog.vitals.spo2}%</Typography>
                    )}
                    {consultDialog.vitals.weight && (
                      <Typography variant="body2">Weight: {consultDialog.vitals.weight} kg</Typography>
                    )}
                  </Box>
                </Box>
              )}

            <Divider />

            <TextField
              label="Diagnosis"
              fullWidth
              multiline
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
            />
            <TextField
              label="Prescription"
              fullWidth
              multiline
              rows={3}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Enter prescription details..."
            />
            <TextField
              label="Additional Notes (optional)"
              fullWidth
              multiline
              rows={2}
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setConsultDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteConsultation}
            variant="contained"
            disabled={!diagnosis || saving}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #43A047, #66BB6A)",
              "&:hover": { background: "linear-gradient(135deg, #2E7D32, #43A047)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Complete & Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Detail Dialog */}
      <Dialog
        open={!!detailDialog}
        onClose={() => setDetailDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Patient Details</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight={600}>{detailDialog.patient.name}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Institute ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{detailDialog.patient.instituteId}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{detailDialog.patient.email}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{detailDialog.patient.phone || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Blood Group</Typography>
                  <Typography variant="body2">{detailDialog.patient.bloodGroup || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Allergies</Typography>
                  <Typography variant="body2">
                    {detailDialog.patient.allergies?.length
                      ? detailDialog.patient.allergies.join(", ")
                      : "None reported"}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="caption" color="text.secondary">Reason for Visit</Typography>
              <Typography variant="body2" mb={2}>{detailDialog.reason}</Typography>

              {detailDialog.diagnosis && (
                <>
                  <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                  <Typography variant="body2" mb={2}>{detailDialog.diagnosis}</Typography>
                </>
              )}

              {detailDialog.prescription && (
                <>
                  <Typography variant="caption" color="text.secondary">Prescription</Typography>
                  <Typography variant="body2" mb={2}>{detailDialog.prescription}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDetailDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientQueue;