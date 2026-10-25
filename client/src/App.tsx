import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArenaView } from './components/ArenaView';
import { MindInspector } from './components/MindInspector';
import { MetricsDock } from './components/MetricsDock';
import { SessionControls } from './components/SessionControls';
import { SessionModal } from './components/SessionModal';
import { HistoryModal } from './components/HistoryModal';
import { useDialecticSocket } from './hooks/useDialecticSocket';
import { ISession } from './types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [highlightedTurnIndex, setHighlightedTurnIndex] = useState<number | null>(null);
  const [scrubTurn, setScrubTurn] = useState<number>(1);

  const {
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
  } = useDialecticSocket(activeSessionId);

  // Sync scrubber to current turn when new turns arrive
  useEffect(() => {
    if (turns.length > 0) {
      setScrubTurn(turns.length);
    }
  }, [turns.length]);

  // Initial load: Fetch the latest session or create a seed demo session
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.data && data.data.length > 0) {
          setActiveSessionId(data.data[0]._id);
        } else {
          // Seed demo session
          const seedRes = await fetch('/api/sessions/seed-demo', { method: 'POST' });
          const seedData = await seedRes.json();
          if (seedData.success && seedData.data) {
            setActiveSessionId(seedData.data._id);
          }
        }
      })
      .catch((err) => console.error('Failed to initialize session:', err));
  }, []);

  const handleCreateSession = async (config: {
    topic: string;
    maxTurns: number;
    agentConfig: {
      agentA: { name: string; corePremise: string; colorTheme: string };
      agentB: { name: string; corePremise: string; colorTheme: string };
    };
  }) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveSessionId(data.data._id);
      }
    } catch (err) {
      console.error('Error creating new session:', err);
    }
  };

  const visibleTurns = turns.slice(0, scrubTurn);
  const visibleReflections = reflections.filter((r) => r.turnIndex < scrubTurn);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100">
      {/* Top Bar */}
      <Header
        session={session}
        isConnected={isConnected}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col gap-5 max-w-[1720px] mx-auto w-full">
        {/* Error notification banner if any */}
        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Dialectic Cockpit: Arena Stream (2/3) + Mind Inspector (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[580px]">
          {/* Arena View: Dual Column Debate Feed */}
          <div className="lg:col-span-8 h-[580px] lg:h-[620px]">
            <ArenaView
              session={session}
              turns={visibleTurns}
              thinkingState={thinkingState}
              highlightedTurnIndex={highlightedTurnIndex}
            />
          </div>

          {/* Mind Inspector: Introspective passes & delta-stances */}
          <div className="lg:col-span-4 h-[580px] lg:h-[620px]">
            <MindInspector
              reflections={visibleReflections}
              session={session}
              onSelectTurn={(turnIndex) => {
                setHighlightedTurnIndex(turnIndex);
                if (turnIndex >= scrubTurn) {
                  setScrubTurn(turnIndex + 1);
                }
              }}
            />
          </div>
        </div>

        {/* Session Playback & Stepper Dock */}
        <SessionControls
          session={session}
          turns={turns}
          onStart={startSession}
          onPause={pauseSession}
          onResume={resumeSession}
          onStep={stepSession}
          onAbort={abortSession}
          currentScrubTurn={scrubTurn}
          onScrubChange={(turn) => {
            setScrubTurn(turn);
            setHighlightedTurnIndex(turn - 1);
          }}
        />

        {/* Bottom Dock: Recharts Convergence Trajectory & Metrics */}
        <MetricsDock
          reflections={visibleReflections}
          session={session}
          onSelectTurn={(turnIndex) => {
            setHighlightedTurnIndex(turnIndex);
            if (turnIndex >= scrubTurn) {
              setScrubTurn(turnIndex + 1);
            }
          }}
        />
      </main>

      {/* Topic & Premise Configurator Modal */}
      <SessionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateSession={handleCreateSession}
      />

      {/* History & Replay Explorer Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectSession={(id) => setActiveSessionId(id)}
        activeSessionId={activeSessionId}
      />
    </div>
  );
};

export default App;
