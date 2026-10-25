import React, { useState } from 'react';
import { Eye, TrendingUp, Sparkles, Compass, Lightbulb, ShieldAlert, Layers } from 'lucide-react';
import { IAgentReflection, ISession } from '../types';

interface MindInspectorProps {
  reflections: IAgentReflection[];
  session: ISession | null;
  onSelectTurn?: (turnIndex: number) => void;
}

export const MindInspector: React.FC<MindInspectorProps> = ({
  reflections,
  session,
  onSelectTurn,
}) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<'all' | 'agent_a' | 'agent_b'>('all');

  const filteredReflections = reflections.filter((r) => {
    if (selectedAgentFilter === 'all') return true;
    return r.agentId === selectedAgentFilter;
  });

  const agentAName = session?.agentConfig?.agentA?.name || 'Agent A';
  const agentBName = session?.agentConfig?.agentB?.name || 'Agent B';

  const getConvergenceColor = (score: number) => {
    if (score >= 0.85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 0.6) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (score >= 0.4) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              Metacognitive Mind Inspector
            </h3>
            <span className="text-[10px] text-slate-400">
              Delta Stances & Vector Insights ({reflections.length} consolidated)
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
          <button
            onClick={() => setSelectedAgentFilter('all')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              selectedAgentFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedAgentFilter('agent_a')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              selectedAgentFilter === 'agent_a'
                ? 'bg-indigo-600/40 text-indigo-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Agent A
          </button>
          <button
            onClick={() => setSelectedAgentFilter('agent_b')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              selectedAgentFilter === 'agent_b'
                ? 'bg-amber-600/40 text-amber-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Agent B
          </button>
        </div>
      </div>

      {/* Stream of Reflection Cards */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {filteredReflections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-500 space-y-2">
            <Compass className="w-8 h-8 text-slate-600 stroke-[1.5]" />
            <p className="text-xs">No introspective passes recorded yet.</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              When an agent completes a turn, Gemini 1.5 Flash evaluates stance shifts and outputs structured convergence metrics.
            </p>
          </div>
        ) : (
          [...filteredReflections].reverse().map((ref) => {
            const isAgentA = ref.agentId === 'agent_a';
            return (
              <div
                key={ref.reflectionId || `ref-${ref.turnIndex}-${ref.agentId}`}
                onClick={() => onSelectTurn && onSelectTurn(ref.turnIndex)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                  isAgentA
                    ? 'bg-slate-900/60 hover:bg-slate-900/90 border-indigo-950/80 hover:border-indigo-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 border-amber-950/80 hover:border-amber-500/40'
                }`}
              >
                {/* Card Header: Agent & Convergence score */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-bold ${
                        isAgentA ? 'text-indigo-400' : 'text-amber-400'
                      }`}
                    >
                      {isAgentA ? agentAName : agentBName}
                    </span>
                    <span className="mono-text text-[10px] text-slate-500">
                      Turn #{ref.turnIndex + 1}
                    </span>
                  </div>

                  <span
                    className={`mono-text text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getConvergenceColor(
                      ref.convergenceScore
                    )}`}
                  >
                    <TrendingUp className="w-2.5 h-2.5" />
                    Score: {(ref.convergenceScore * 100).toFixed(0)}% ({ref.convergenceScore.toFixed(2)})
                  </span>
                </div>

                {/* Delta Stance Evolution */}
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-0.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>DELTA STANCE SHIFT:</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    "{ref.deltaStance}"
                  </p>
                </div>

                {/* Insight Gained */}
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-0.5">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>CONCEDED INSIGHT / PREMISE:</span>
                  </div>
                  <p className="text-[11.5px] text-slate-300 italic pl-1 border-l-2 border-indigo-500/50">
                    {ref.insight}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
