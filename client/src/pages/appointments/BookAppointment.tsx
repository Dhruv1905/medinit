import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { getDoctors, getAvailableSlots, bookAppointment } from "../../services/appointmentService";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  instituteId: string;
}

const steps = ["Select Doctor & Date", "Choose Time Slot", "Confirm Booking"];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getDoctors();
        setDoctors(res.data.doctors);
      } catch {
        setError("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        try {
          const res = await getAvailableSlots(selectedDoctor, selectedDate);
          setAvailableSlots(res.data.slots);
        } catch {
          setError("Failed to load slots");
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    setError("");
    setLoading(true);
    try {
      await bookAppointment({
        doctor: selectedDoctor,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
        priority,
      });
      setSuccess(true);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getSelectedDoctorName = () => {
    return doctors.find((d) => d._id === selectedDoctor)?.name || "";
  };

  if (success) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: "'Outfit', sans-serif" }}>
          Appointment Booked!
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={1}>
          Dr. {getSelectedDoctorName()} — {selectedDate} at {selectedSlot}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Reason: {reason}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard/appointments")}
          sx={{
            background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
            "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
          }}
        >
          View My Appointments
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: "'Outfit', sans-serif" }}>
        Book Appointment
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Schedule a visit with a clinic doctor
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Step 1: Doctor & Date */}
      {activeStep === 0 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Select Doctor"
                  select
                  fullWidth
                  value={selectedDoctor}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    setSelectedSlot("");
                  }}
                >
                  {doctors.map((doc) => (
                    <MenuItem key={doc._id} value={doc._id}>
                      Dr. {doc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Select Date"
                  type="date"
                  fullWidth
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot("");
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getTodayString() }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Reason for Visit"
                  fullWidth
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason..."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Priority"
                  select
                  fullWidth
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={!selectedDoctor || !selectedDate || !reason}
                onClick={() => setActiveStep(1)}
                sx={{
                  background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                  "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
                }}
              >
                Next — Choose Time
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Time Slot */}
      {activeStep === 1 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <CalendarMonthIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Available Slots — {selectedDate}
              </Typography>
            </Box>

            {slotsLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : availableSlots.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                No available slots for this date. Please choose another date.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {availableSlots.map((slot) => (
                  <Chip
                    key={slot}
                    label={slot}
                    clickable
                    onClick={() => setSelectedSlot(slot)}
                    sx={{
                      px: 2,
                      py: 2.5,
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      borderRadius: 3,
                      border: selectedSlot === slot ? "2px solid #3B82F6" : "2px solid rgba(59,130,246,0.1)",
                      bgcolor: selectedSlot === slot ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.5)",
                      color: selectedSlot === slot ? "primary.dark" : "text.primary",
                      "&:hover": { bgcolor: "rgba(59,130,246,0.06)" },
                    }}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Button
                variant="contained"
                disabled={!selectedSlot || loading}
                onClick={handleBook}
                sx={{
                  background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                  "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Confirm Booking"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BookAppointment;