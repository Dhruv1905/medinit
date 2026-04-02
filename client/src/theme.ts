import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1B6DA1",
      light: "#4BA3D8",
      dark: "#0E4D73",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00BCD4",
      light: "#4DD0E1",
      dark: "#0097A7",
    },
    error: {
      main: "#E53935",
    },
    warning: {
      main: "#FB8C00",
    },
    success: {
      main: "#43A047",
    },
    background: {
      default: "#F4F7FC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E2A3A",
      secondary: "#6B7B8D",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          padding: "10px 28px",
          fontSize: "0.9rem",
        },
        contained: {
          boxShadow: "0 4px 14px rgba(27, 109, 161, 0.25)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(27, 109, 161, 0.35)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 15px rgba(0, 0, 0, 0.04)",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.04)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme;