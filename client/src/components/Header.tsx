import React from 'react';
import { Cpu, PlusCircle, History, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { ISession } from '../types';

interface HeaderProps {
  session: ISession | null;
  isConnected: boolean;
  onOpenNewModal: () => void;
  onOpenHistoryModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  isConnected,
  onOpenNewModal,
  onOpenHistoryModal,
}) => {
  const getStatusBadge = () => {
    if (!session) return null;
    switch (session.status) {
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LIVE DELIBERATION
          </span>
        );
      case 'PAUSED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            PAUSED
          </span>
        );
      case 'CONVERGED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            SYNTHESIS CONVERGED
          </span>
        );
      case 'EXHAUSTED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            TURNS EXHAUSTED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/30 text-slate-400 border border-slate-700/60">
            {session.status}
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#07090E]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
          <Cpu className="w-5 h-5 text-white" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#07090E] animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              SYNTHETICA
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Dialectic Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Multi-Agent Emergent Reasoning via Episodic Vector Memory
          </p>
        </div>
      </div>

      {/* Active Session Telemetry & Status */}
      {session && (
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/90 rounded-xl px-4 py-1.5 max-w-xl truncate">
          <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex flex-col truncate">
            <span className="text-xs font-medium text-slate-200 truncate">{session.topic}</span>
            <span className="text-[11px] text-slate-400">
              Turn <span className="text-indigo-300 font-semibold">{session.currentTurn}</span> of {session.maxTurns}
            </span>
          </div>
          <div className="shrink-0 ml-2">{getStatusBadge()}</div>
        </div>
      )}

      {/* Actions & Connection state */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-400 hidden md:inline">
            {isConnected ? 'Gateway Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={onOpenHistoryModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 text-xs font-medium transition-all"
          title="Past Sessions"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sessions</span>
        </button>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Dialectic</span>
        </button>
      </div>
    </header>
  );
};
