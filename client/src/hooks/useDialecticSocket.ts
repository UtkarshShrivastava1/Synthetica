import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ISession, IRawTurn, IAgentReflection, IThinkingState, SessionStatus } from '../types';

const SOCKET_SERVER_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:5000';

export function useDialecticSocket(activeSessionId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [session, setSession] = useState<ISession | null>(null);
  const [turns, setTurns] = useState<IRawTurn[]>([]);
  const [reflections, setReflections] = useState<IAgentReflection[]>([]);
  const [thinkingState, setThinkingState] = useState<IThinkingState | null>(null);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      if (activeSessionId) {
        socket.emit('session:join', { sessionId: activeSessionId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
      setIsConnected(false);
    });

    socket.on('session:synced', (data: { session: ISession; turns: IRawTurn[]; reflections: IAgentReflection[] }) => {
      setSession(data.session);
      setTurns(data.turns);
      setReflections(data.reflections);
      setThinkingState(null);
      if (data.session.status === 'CONVERGED' || data.session.status === 'EXHAUSTED' || data.session.status === 'FAILED') {
        setTerminationReason(data.session.status);
      } else {
        setTerminationReason(null);
      }
    });

    socket.on('session:status', (data: { sessionId: string; status: SessionStatus; currentTurn: number }) => {
      setSession((prev) => (prev ? { ...prev, status: data.status, currentTurn: data.currentTurn } : null));
      if (data.status === 'PAUSED' || data.status === 'RUNNING') {
        setThinkingState(null);
      }
    });

    socket.on('turn:thinking', (data: IThinkingState) => {
      setThinkingState(data);
    });

    socket.on('turn:complete', (data: IRawTurn) => {
      setTurns((prev) => {
        // Prevent duplicate turns
        const exists = prev.some((t) => t.turnIndex === data.turnIndex);
        if (exists) return prev;
        return [...prev, data];
      });
      setSession((prev) => (prev ? { ...prev, currentTurn: data.turnIndex + 1 } : null));
    });

    socket.on('reflection:new', (data: IAgentReflection) => {
      setReflections((prev) => {
        const exists = prev.some((r) => r.reflectionId === data.reflectionId || (r.turnIndex === data.turnIndex && r.agentId === data.agentId));
        if (exists) return prev;
        return [...prev, data];
      });
      // Clear thinking after reflection finishes
      setThinkingState(null);
    });

    socket.on('session:ended', (data: { sessionId: string; reason: string; finalTurn: number }) => {
      setTerminationReason(data.reason);
      setThinkingState(null);
      setSession((prev) => (prev ? { ...prev, status: data.reason as SessionStatus, currentTurn: data.finalTurn } : null));
    });

    socket.on('session:error', (data: { sessionId: string; message: string }) => {
      setError(data.message);
      setThinkingState(null);
    });

    return () => {
      if (activeSessionId) {
        socket.emit('session:leave', { sessionId: activeSessionId });
      }
      socket.disconnect();
    };
  }, []);

  // Join or switch room when activeSessionId changes
  useEffect(() => {
    if (!socketRef.current || !activeSessionId || !isConnected) return;

    socketRef.current.emit('session:join', { sessionId: activeSessionId });

    return () => {
      socketRef.current?.emit('session:leave', { sessionId: activeSessionId });
    };
  }, [activeSessionId, isConnected]);

  const startSession = useCallback(() => {
    if (socketRef.current && activeSessionId) {
      setError(null);
      setTerminationReason(null);
      socketRef.current.emit('session:start', { sessionId: activeSessionId });
    }
  }, [activeSessionId]);

  const pauseSession = useCallback(() => {
    if (socketRef.current && activeSessionId) {
      socketRef.current.emit('session:pause', { sessionId: activeSessionId });
    }
  }, [activeSessionId]);

  const resumeSession = useCallback(() => {
    if (socketRef.current && activeSessionId) {
      socketRef.current.emit('session:resume', { sessionId: activeSessionId });
    }
  }, [activeSessionId]);

  const stepSession = useCallback(() => {
    if (socketRef.current && activeSessionId) {
      socketRef.current.emit('session:step', { sessionId: activeSessionId });
    }
  }, [activeSessionId]);

  const abortSession = useCallback(() => {
    if (socketRef.current && activeSessionId) {
      socketRef.current.emit('session:abort', { sessionId: activeSessionId });
    }
  }, [activeSessionId]);

  return {
    isConnected,
    session,
    turns,
    reflections,
    thinkingState,
    terminationReason,
    error,
    startSession,
    pauseSession,
    resumeSession,
    stepSession,
    abortSession,
    setSession,
    setTurns,
    setReflections,
  };
}
