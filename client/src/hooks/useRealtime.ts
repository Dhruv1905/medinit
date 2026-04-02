import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

export const useRealtime = (event: string, callback: () => void) => {
  const { subscribe } = useSocket();
  const callbackRef = useRef(callback);

  // Always keep the ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = subscribe(event, () => {
      callbackRef.current();
    });
    return unsubscribe;
  }, [event, subscribe]);
};