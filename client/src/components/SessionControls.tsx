import React from 'react';
import { Play, Pause, StepForward, RotateCcw, AlertOctagon, Sliders, Volume2, FastForward } from 'lucide-react';
import { ISession, IRawTurn } from '../types';

interface SessionControlsProps {
  session: ISession | null;
  turns: IRawTurn[];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onAbort: () => void;
  currentScrubTurn: number;
  onScrubChange: (turn: number) => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  turns,
  onStart,
  onPause,
  onResume,
  onStep,
  onAbort,
  currentScrubTurn,
  onScrubChange,
}) => {
  if (!session) return null;

  const isRunning = session.status === 'RUNNING';
  const isPaused = session.status === 'PAUSED';
  const isInitializing = session.status === 'INITIALIZING';
  const isEnded = session.status === 'CONVERGED' || session.status === 'EXHAUSTED' || session.status === 'FAILED';

  const totalTurns = turns.length;

  return (
    <div className="bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Control Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {isInitializing && (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Dialectic</span>
          </button>
        )}

        {isRunning && (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume</span>
          </button>
        )}

        {/* Step-by-Step trigger */}
        <button
          onClick={onStep}
          disabled={isRunning || isEnded}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Execute exactly one turn and pause for deep inspection"
        >
          <StepForward className="w-4 h-4 text-cyan-400" />
          <span>Step Turn</span>
        </button>

        {/* Abort Session */}
        {!isEnded && !isInitializing && (
          <button
            onClick={onAbort}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
            title="Halt active session"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Abort</span>
          </button>
        )}

        {isEnded && (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        )}
      </div>

      {/* Scrub & Replay Timeline Slider */}
      <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
        <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex flex-col w-full gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Replay Scrub Timeline:</span>
            <span className="mono-text font-bold text-indigo-400">
              {totalTurns === 0 ? 'No turns' : `Turn ${currentScrubTurn} of ${totalTurns}`}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={Math.max(1, totalTurns)}
            value={currentScrubTurn}
            disabled={totalTurns <= 1}
            onChange={(e) => onScrubChange(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
};
