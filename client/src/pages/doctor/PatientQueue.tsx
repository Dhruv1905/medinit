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
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import { getAllMedicines } from "../../services/medicineService";
import { useRealtime } from "../../hooks/useRealtime";

interface Medicine {
  _id: string;
  name: string;
  quantity: number;
}

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  dose: string;
  timing: string;
  schedule: string[];
}

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
  prescriptionItems?: PrescriptionItem[];
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
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [consultNotes, setConsultNotes] = useState("");
  const [isExternalReference, setIsExternalReference] = useState(false);
  const [externalHospitalName, setExternalHospitalName] = useState("");
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

  const fetchMedicines = async () => {
    try {
      const res = await getAllMedicines();
      setMedicines(res.data.medicines);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchMedicines();
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
    setPrescriptionItems(apt.prescriptionItems || []);
    setConsultNotes(apt.notes || "");
    setIsExternalReference(false);
    setExternalHospitalName("");
  };

  const handleCompleteConsultation = async () => {
    if (!consultDialog) return;
    setSaving(true);
    try {
      await updateAppointmentStatus(consultDialog._id, {
        status: "completed",
        diagnosis,
        prescription,
        prescriptionItems,
        notes: consultNotes,
        isExternalReference,
        externalHospitalName: isExternalReference ? externalHospitalName : undefined
      });
      setConsultDialog(null);
      setDiagnosis("");
      setPrescription("");
      setPrescriptionItems([]);
      setConsultNotes("");
      setIsExternalReference(false);
      setExternalHospitalName("");
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
      case "scheduled": return "#3B82F6";
      case "in_queue": return "#06B6D4";
      case "in_consultation": return "#F59E0B";
      case "completed": return "#10B981";
      case "cancelled": return "#EF4444";
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
            <IconButton onClick={fetchAppointments} sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
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
              <Typography variant="h4" fontWeight={800} color="#F59E0B">
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
                borderLeft: `4px solid ${apt.priority === "emergency"
                  ? "#EF4444"
                  : apt.priority === "urgent"
                    ? "#F59E0B"
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
                              bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
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
                            sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                          >
                            <PlayArrowIcon sx={{ color: "primary.main" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark No Show">
                          <IconButton
                            onClick={() => handleMarkNoShow(apt._id)}
                            sx={{ bgcolor: "#FFF3E0" }}
                          >
                            <PersonIcon sx={{ color: "#F59E0B" }} />
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
                        sx={{ bgcolor: "rgba(255, 255, 255, 0.12)" }}
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
                      bgcolor: "rgba(255, 255, 255, 0.12)",
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
        maxWidth="md"
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
              <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.12)", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  REASON FOR VISIT
                </Typography>
                <Typography variant="body2">{consultDialog.reason}</Typography>
              </Box>
            )}

            {consultDialog?.vitals &&
              Object.keys(consultDialog.vitals).some((k) => (consultDialog.vitals as any)[k]) && (
                <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.12)", borderRadius: 2 }}>
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
              label="Prescription Notes"
              fullWidth
              multiline
              rows={2}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Enter general prescription notes..."
            />

            <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.12)", borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Medicines (Inventory Link)</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setPrescriptionItems([...prescriptionItems, { medicineId: "", medicineName: "", quantity: 1, dose: "", timing: "After Food", schedule: ["Morning"] }])}
                >
                  Add Medicine
                </Button>
              </Box>
              {prescriptionItems.map((item, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}>
                  <TextField
                    select
                    label="Medicine"
                    size="small"
                    sx={{ flex: 2 }}
                    value={item.medicineId}
                    onChange={(e) => {
                      const m = medicines.find(med => med._id === e.target.value);
                      const newItems = [...prescriptionItems];
                      newItems[index].medicineId = e.target.value;
                      if (m) newItems[index].medicineName = m.name;
                      setPrescriptionItems(newItems);
                    }}
                  >
                    {medicines.map((m) => (
                      <MenuItem key={m._id} value={m._id}>
                        {m.name} (Stock: {m.quantity})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Qty"
                    type="number"
                    size="small"
                    sx={{ width: 70 }}
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...prescriptionItems];
                      newItems[index].quantity = parseInt(e.target.value, 10) || 1;
                      setPrescriptionItems(newItems);
                    }}
                  />
                  <TextField
                    label="Dose/Day"
                    size="small"
                    sx={{ width: 90 }}
                    value={item.dose}
                    onChange={(e) => {
                      const newItems = [...prescriptionItems];
                      newItems[index].dose = e.target.value;
                      setPrescriptionItems(newItems);
                    }}
                  />
                  <TextField
                    select
                    label="Timing"
                    size="small"
                    sx={{ width: 130 }}
                    value={item.timing}
                    onChange={(e) => {
                      const newItems = [...prescriptionItems];
                      newItems[index].timing = e.target.value;
                      setPrescriptionItems(newItems);
                    }}
                  >
                    <MenuItem value="Before Food">Before Food</MenuItem>
                    <MenuItem value="After Food">After Food</MenuItem>
                    <MenuItem value="Empty Stomach">Empty Stomach</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Schedule"
                    size="small"
                    sx={{ width: 120 }}
                    value={item.schedule}
                    SelectProps={{ multiple: true }}
                    onChange={(e) => {
                      const newItems = [...prescriptionItems];
                      newItems[index].schedule = typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]);
                      setPrescriptionItems(newItems);
                    }}
                  >
                    <MenuItem value="Morning">Morning</MenuItem>
                    <MenuItem value="Afternoon">Afternoon</MenuItem>
                    <MenuItem value="Evening">Evening</MenuItem>
                    <MenuItem value="Night">Night</MenuItem>
                    <MenuItem value="SOS">SOS (As needed)</MenuItem>
                  </TextField>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      const newItems = [...prescriptionItems];
                      newItems.splice(index, 1);
                      setPrescriptionItems(newItems);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <TextField
              label="Additional Notes (optional)"
              fullWidth
              multiline
              rows={2}
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="Any additional notes..."
            />

            <Divider sx={{ my: 1 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isExternalReference}
                  onChange={(e) => setIsExternalReference(e.target.checked)}
                  color="primary"
                />
              }
              label="Refer to External Hospital"
            />

            {isExternalReference && (
              <TextField
                label="External Hospital Name"
                fullWidth
                value={externalHospitalName}
                onChange={(e) => setExternalHospitalName(e.target.value)}
                placeholder="e.g. Apollo Hospital"
                required={isExternalReference}
              />
            )}
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
              background: "linear-gradient(135deg, #10B981, #34D399)",
              "&:hover": { background: "linear-gradient(135deg, #059669, #10B981)" },
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
                  <Typography variant="caption" color="text.secondary">Prescription Notes</Typography>
                  <Typography variant="body2" mb={2}>{detailDialog.prescription}</Typography>
                </>
              )}

              {detailDialog.prescriptionItems && detailDialog.prescriptionItems.length > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary">Prescriptions</Typography>
                  <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    {detailDialog.prescriptionItems.map((item, idx) => (
                      <Box key={idx} sx={{ display: "flex", gap: 2, bgcolor: "rgba(255, 255, 255, 0.12)", p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{item.medicineName}</Typography>
                        <Typography variant="body2">Qty: {item.quantity}</Typography>
                        <Typography variant="body2">Dose: {item.dose}</Typography>
                        <Typography variant="body2">{item.timing}</Typography>
                        <Typography variant="body2">{item.schedule.join(", ")}</Typography>
                      </Box>
                    ))}
                  </Box>
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