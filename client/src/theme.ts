import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#1D4ED8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#06B6D4",
      light: "#22D3EE",
      dark: "#0891B2",
    },
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#F59E0B",
    },
    success: {
      main: "#10B981",
    },
    background: {
      default: "#EFF6FF",
      paper: "rgba(255, 255, 255, 0.65)",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "#EFF6FF",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          padding: "10px 28px",
          fontSize: "0.9rem",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contained: {
          boxShadow: "0 4px 14px rgba(59, 130, 246, 0.25)",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(59, 130, 246, 0.35)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          backdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.12)",
          borderColor: "rgba(255, 255, 255, 0.3)",
          "&:hover": {
            borderWidth: "1.5px",
            background: "rgba(255, 255, 255, 0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.12), inset 0 0 0 0.5px rgba(255, 255, 255, 0.2)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 16px 48px rgba(31, 38, 135, 0.18), inset 0 0 0 0.5px rgba(255, 255, 255, 0.3)",
            background: "rgba(255, 255, 255, 0.22)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          background: "rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 4px 24px rgba(31, 38, 135, 0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            transition: "all 0.25s ease",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.25)",
              transition: "all 0.25s ease",
            },
            "&:hover fieldset": {
              borderColor: "rgba(59, 130, 246, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3B82F6",
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.08)",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 24px 80px rgba(31, 38, 135, 0.2), inset 0 0 0 0.5px rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            fontWeight: 700,
            color: "#1E293B",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background 0.2s ease",
          "&:hover": {
            background: "rgba(59, 130, 246, 0.03) !important",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backdropFilter: "blur(8px)",
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(16px)",
          borderRadius: 16,
          padding: "16px 24px",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 4px 20px rgba(31, 38, 135, 0.06)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: 10,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;