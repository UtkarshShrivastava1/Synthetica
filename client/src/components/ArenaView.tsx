import React, { useState, useEffect, useRef } from 'react';
import { Bot, Brain, Database, Sparkles, ChevronDown, ChevronUp, Clock, Network } from 'lucide-react';
import { ISession, IRawTurn, IThinkingState } from '../types';

interface ArenaViewProps {
  session: ISession | null;
  turns: IRawTurn[];
  thinkingState: IThinkingState | null;
  highlightedTurnIndex?: number | null;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  session,
  turns,
  thinkingState,
  highlightedTurnIndex,
}) => {
  const [expandedMemories, setExpandedMemories] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, thinkingState]);

  const toggleMemory = (turnIndex: number) => {
    setExpandedMemories((prev) => ({
      ...prev,
      [turnIndex]: !prev[turnIndex],
    }));
  };

  const agentA = session?.agentConfig?.agentA || {
    name: 'Agent A',
    corePremise: 'Thesis perspective',
    colorTheme: '#6366F1',
  };

  const agentB = session?.agentConfig?.agentB || {
    name: 'Agent B',
    corePremise: 'Antithesis perspective',
    colorTheme: '#F59E0B',
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {/* Arena Sub-header: Agent Identity Cards */}
      <div className="grid grid-cols-2 divide-x divide-slate-800/80 border-b border-slate-800/80 bg-slate-900/40">
        {/* Agent A Header */}
        <div className="p-3.5 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-indigo-300 truncate">{agentA.name}</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Agent A
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs" title={agentA.corePremise}>
                {agentA.corePremise}
              </p>
            </div>
          </div>
        </div>

        {/* Agent B Header */}
        <div className="p-3.5 flex items-center justify-between gap-3 bg-gradient-to-l from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-amber-300 truncate">{agentB.name}</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Agent B
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs" title={agentB.corePremise}>
                {agentB.corePremise}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
        {turns.length === 0 && !thinkingState && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
              <Network className="w-7 h-7 text-indigo-400/60" />
            </div>
            <div className="max-w-md">
              <h4 className="text-base font-semibold text-slate-200">Dialectic Arena Initialized</h4>
              <p className="text-xs text-slate-400 mt-1">
                Hit <span className="text-indigo-400 font-semibold">Start Dialectic</span> or <span className="text-amber-400 font-semibold">Step Turn</span> to trigger the first turn. Agent A will synthesize an opening proposition grounded in its core premise.
              </p>
            </div>
          </div>
        )}

        {turns.map((turn) => {
          const isAgentA = turn.sender === 'agent_a';
          const isExpanded = !!expandedMemories[turn.turnIndex];
          const hasMemories = turn.retrievedMemories && turn.retrievedMemories.length > 0;
          const isHighlighted = highlightedTurnIndex === turn.turnIndex;

          return (
            <div
              key={`turn-${turn.turnIndex}`}
              className={`flex flex-col transition-all duration-300 ${
                isAgentA ? 'items-start pr-6 lg:pr-16' : 'items-end pl-6 lg:pl-16'
              } ${isHighlighted ? 'ring-2 ring-indigo-400/80 rounded-2xl p-1' : ''}`}
            >
              <div
                className={`w-full max-w-3xl rounded-2xl p-4.5 border shadow-lg transition-all ${
                  isAgentA
                    ? 'bg-gradient-to-br from-[#121625] to-[#0F1420] border-indigo-500/30 text-slate-100 hover:border-indigo-500/50'
                    : 'bg-gradient-to-br from-[#1B1713] to-[#141212] border-amber-500/30 text-slate-100 hover:border-amber-500/50'
                }`}
              >
                {/* Turn Header */}
                <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isAgentA ? 'text-indigo-300' : 'text-amber-300'
                      }`}
                    >
                      {isAgentA ? agentA.name : agentB.name}
                    </span>
                    <span className="mono-text text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      Turn #{turn.turnIndex + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Turn Natural Language Content */}
                <p className="text-[13.5px] leading-relaxed text-slate-200 whitespace-pre-line font-normal">
                  {turn.message}
                </p>

                {/* Sub-card: Retrieved Vector Memories */}
                {hasMemories && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/70">
                    <button
                      onClick={() => toggleMemory(turn.turnIndex)}
                      className="flex items-center justify-between w-full text-left text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1 group"
                    >
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-300/90 font-mono text-[11px]">
                          Atlas Vector Search Recall ({turn.retrievedMemories.length} memories)
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 animate-fade-in">
                        {turn.retrievedMemories.map((mem, idx) => (
                          <div
                            key={`mem-${idx}`}
                            className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                                Memory #{idx + 1}
                              </span>
                              <span className="mono-text text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                                Cosine Sim: {(mem.similarityScore * 100).toFixed(1)}% ({mem.similarityScore.toFixed(4)})
                              </span>
                            </div>
                            <p className="text-slate-300 text-[12px] italic">"{mem.insight}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Thinking Status Pill */}
        {thinkingState && (
          <div
            className={`flex flex-col animate-fade-in ${
              thinkingState.agentId === 'agent_a' ? 'items-start pr-12' : 'items-end pl-12'
            }`}
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl ${
                thinkingState.agentId === 'agent_a'
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 shadow-indigo-950/50'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-amber-950/50'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Brain className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="text-xs">
                <span className="font-bold">
                  {thinkingState.agentId === 'agent_a' ? agentA.name : agentB.name}
                </span>{' '}
                is{' '}
                <span className="font-semibold text-white uppercase tracking-wider">
                  {thinkingState.step === 'retrieving' && 'searching Atlas Vector Memory ($vectorSearch)...'}
                  {thinkingState.step === 'deliberating' && 'synthesizing dialectic response (Gemini Pro)...'}
                  {thinkingState.step === 'reflecting' && 'extracting metacognitive reflection (Gemini Flash)...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
