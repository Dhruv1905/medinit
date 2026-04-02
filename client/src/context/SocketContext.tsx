import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./Authcontext";

interface SocketContextType {
  subscribe: (event: string, callback: () => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<() => void>>>(new Map());

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-role", user.role);
      socket.emit("join-user", user.id);
    });

    const events = [
      "appointment-update",
      "emergency-update",
      "certificate-update",
      "prescription-update",
      "inventory-update",
      "user-update",
    ];

    events.forEach((event) => {
      socket.on(event, () => {
        const callbacks = listenersRef.current.get(event);
        if (callbacks) {
          callbacks.forEach((cb) => cb());
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const subscribe = useCallback((event: string, callback: () => void): (() => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    return () => {
      listenersRef.current.get(event)?.delete(callback);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};