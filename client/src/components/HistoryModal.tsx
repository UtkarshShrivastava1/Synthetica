import React, { useEffect, useState } from 'react';
import { X, History, CheckCircle2, ChevronRight, Activity, Calendar } from 'lucide-react';
import { ISession } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  activeSessionId: string | null;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSession,
  activeSessionId,
}) => {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/sessions')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSessions(data.data);
          }
        })
        .catch((err) => console.error('Failed to load sessions:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D111C] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dialectic Sessions Archive</h2>
              <p className="text-xs text-slate-400">Select any past multi-agent discourse to explore or replay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading archived sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recorded sessions found. Launch a new dialectic experiment to begin!
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = activeSessionId === sess._id;
              return (
                <div
                  key={sess._id}
                  onClick={() => {
                    onSelectSession(sess._id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-100 truncate">{sess.topic}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          sess.status === 'CONVERGED'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : sess.status === 'RUNNING'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        Turn {sess.currentTurn} / {sess.maxTurns}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">
                        {sess.agentConfig.agentA.name} vs {sess.agentConfig.agentB.name}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(sess.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
