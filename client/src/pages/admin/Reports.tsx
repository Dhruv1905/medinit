import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmergencyIcon from "@mui/icons-material/Emergency";
import InventoryIcon from "@mui/icons-material/Inventory";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { getDashboardReport } from "../../services/reportsService";

interface Report {
  users: { total: number; byRole: Record<string, number> };
  appointments: {
    today: number;
    completedToday: number;
    thisMonth: number;
    lastMonth: number;
    byStatus: Record<string, number>;
    weeklyTrend: { date: string; day: string; count: number }[];
    topReasons: { _id: string; count: number }[];
  };
  emergencies: { active: number; thisMonth: number };
  medicines: { lowStock: number; expired: number };
  certificates: { pending: number; issuedThisMonth: number };
  doctorWorkload: { name: string; count: number }[];
}

const roleColors: Record<string, string> = {
  student: "#1B6DA1",
  faculty: "#0097A7",
  doctor: "#43A047",
  nurse: "#FB8C00",
  pharmacist: "#7B1FA2",
  admin: "#E53935",
};

const Reports = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getDashboardReport();
        setReport(res.data.report);
      } catch {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
  }

  if (!report) {
    return <Alert severity="error">{error || "No data available"}</Alert>;
  }

  const monthChange = report.appointments.lastMonth > 0
    ? Math.round(((report.appointments.thisMonth - report.appointments.lastMonth) / report.appointments.lastMonth) * 100)
    : 100;

  const maxTrend = Math.max(...report.appointments.weeklyTrend.map((d) => d.count), 1);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Reports & Analytics</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        System-wide overview and insights
      </Typography>

      {/* Key metrics */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #1B6DA1, #4BA3D8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", mx: "auto", mb: 1.5 }}>
                <PeopleIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={800}>{report.users.total}</Typography>
              <Typography variant="caption" color="text.secondary">Total Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #43A047, #66BB6A)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", mx: "auto", mb: 1.5 }}>
                <CalendarMonthIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={800}>{report.appointments.today}</Typography>
              <Typography variant="caption" color="text.secondary">Today's Appointments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #E53935, #EF5350)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", mx: "auto", mb: 1.5 }}>
                <EmergencyIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={800} color="error.main">{report.emergencies.active}</Typography>
              <Typography variant="caption" color="text.secondary">Active Emergencies</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #FB8C00, #FFA726)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", mx: "auto", mb: 1.5 }}>
                <InventoryIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={800} color="#FB8C00">{report.medicines.lowStock}</Typography>
              <Typography variant="caption" color="text.secondary">Low Stock Medicines</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2.5, textAlign: "center" }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: "linear-gradient(135deg, #7B1FA2, #AB47BC)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", mx: "auto", mb: 1.5 }}>
                <DescriptionIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={800}>{report.certificates.pending}</Typography>
              <Typography variant="caption" color="text.secondary">Pending Certificates</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Monthly comparison */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Monthly Appointments</Typography>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  {report.appointments.thisMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>This month</Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                  {monthChange >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 18, color: "success.main" }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 18, color: "error.main" }} />
                  )}
                  <Typography variant="body2" color={monthChange >= 0 ? "success.main" : "error.main"} fontWeight={600}>
                    {monthChange >= 0 ? "+" : ""}{monthChange}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs last month ({report.appointments.lastMonth})
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">BY STATUS</Typography>
              <Box sx={{ mt: 1 }}>
                {Object.entries(report.appointments.byStatus).map(([status, count]) => (
                  <Box key={status} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" textTransform="capitalize">{status.replace("_", " ")}</Typography>
                    <Typography variant="caption" fontWeight={600}>{count}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly trend */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={3}>Weekly Trend</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {report.appointments.weeklyTrend.map((day) => (
                  <Box key={day.date} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography variant="caption" sx={{ width: 35, fontWeight: 600 }}>{day.day}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(day.count / maxTrend) * 100}
                        sx={{
                          height: 20,
                          borderRadius: 2,
                          bgcolor: "#F4F7FC",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 2,
                            background: "linear-gradient(90deg, #1B6DA1, #4BA3D8)",
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ width: 20, textAlign: "right" }}>
                      {day.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Doctor workload + Users by role */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Doctor Workload</Typography>
              {report.doctorWorkload.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No data</Typography>
              ) : (
                report.doctorWorkload.map((doc, i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2">Dr. {doc.name}</Typography>
                    <Chip label={`${doc.count} patients`} size="small" sx={{ bgcolor: "#EBF4FA", color: "primary.main", fontWeight: 600, fontSize: "0.7rem" }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Users by Role</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {Object.entries(report.users.byRole).map(([role, count]) => (
                  <Chip
                    key={role}
                    label={`${role}: ${count}`}
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: 600,
                      bgcolor: (roleColors[role] || "#9E9E9E") + "18",
                      color: roleColors[role] || "#9E9E9E",
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top reasons */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Top Visit Reasons (This Month)</Typography>
              {report.appointments.topReasons.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No data</Typography>
              ) : (
                report.appointments.topReasons.map((reason, i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: i < report.appointments.topReasons.length - 1 ? "1px solid #F0F0F0" : "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ width: 20 }}>
                        #{i + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {reason._id}
                      </Typography>
                    </Box>
                    <Chip label={`${reason.count}`} size="small" sx={{ fontWeight: 700, bgcolor: "#EBF4FA", color: "primary.main" }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Alerts</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {report.emergencies.active > 0 && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {report.emergencies.active} active emergency case(s) need attention
                  </Alert>
                )}
                {report.medicines.expired > 0 && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {report.medicines.expired} medicine(s) have expired
                  </Alert>
                )}
                {report.medicines.lowStock > 0 && (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    {report.medicines.lowStock} medicine(s) are running low on stock
                  </Alert>
                )}
                {report.certificates.pending > 0 && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    {report.certificates.pending} certificate(s) awaiting approval
                  </Alert>
                )}
                {report.emergencies.active === 0 && report.medicines.expired === 0 && report.medicines.lowStock === 0 && report.certificates.pending === 0 && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    All systems running smoothly — no alerts
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;