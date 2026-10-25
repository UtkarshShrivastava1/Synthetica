import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Settings, Play } from 'lucide-react';
import { ISession } from '../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (data: {
    topic: string;
    maxTurns: number;
    agentConfig: {
      agentA: { name: string; corePremise: string; colorTheme: string };
      agentB: { name: string; corePremise: string; colorTheme: string };
    };
  }) => void;
}

const PRESETS = [
  {
    title: 'Monoliths vs Microservices',
    topic: 'Monoliths vs Microservices for Early Stage Engineering Velocity',
    agentA: {
      name: 'Apex Monolith',
      corePremise: 'Monolithic architectures provide superior iteration velocity, simplified transactional consistency, and minimal operational overhead for early-stage teams.',
      colorTheme: '#6366F1',
    },
    agentB: {
      name: 'Nexus Microservices',
      corePremise: 'Fine-grained distributed microservices provide essential domain fault-isolation, independent team deployment cycles, and natural horizontal autoscaling from day one.',
      colorTheme: '#F59E0B',
    },
    maxTurns: 10,
  },
  {
    title: 'AGI Safety: Guardrails vs Acceleration',
    topic: 'Proactive Alignment Guardrails vs Capabilities Acceleration in Frontier AI',
    agentA: {
      name: 'Sentinel Alignment',
      corePremise: 'Safety and interpretability guardrails must be rigorously proven before advancing capability horizons to prevent catastrophic value misalignment and uncontrollable emergent agency.',
      colorTheme: '#6366F1',
    },
    agentB: {
      name: 'Prometheus Frontier',
      corePremise: 'Iterative open capabilities acceleration and widespread decentralized deployment surface alignment issues empirically, enabling defenses to outpace hypothetical risks.',
      colorTheme: '#F59E0B',
    },
    maxTurns: 12,
  },
  {
    title: 'Open Source AI vs Proprietary Moats',
    topic: 'Decentralized Open Weights vs Centrally Governed Frontier Moats',
    agentA: {
      name: 'Veritas OpenSource',
      corePremise: 'Democratized open weights guarantee scientific reproducibility, guard against monopolistic cognitive cartels, and accelerate collective human innovation without vendor lock-in.',
      colorTheme: '#6366F1',
    },
    agentB: {
      name: 'Citadel Enterprise',
      corePremise: 'Centralized proprietary hosting provides enforceable safety watermarks, prevents malicious dual-use weaponization, and finances massive multi-gigawatt compute clusters.',
      colorTheme: '#F59E0B',
    },
    maxTurns: 10,
  },
  {
    title: 'Quantum Interpretation',
    topic: 'Copenhagen Observer Collapse vs Everettian Many-Worlds Mechanics',
    agentA: {
      name: 'Bohr Copenhagen',
      corePremise: 'Wavefunctions represent epistemic probability amplitudes that undergo physical reduction upon classical macroscopic measurement, establishing an empirical observational boundary.',
      colorTheme: '#6366F1',
    },
    agentB: {
      name: 'Everett Multiverse',
      corePremise: 'Universal unitary evolution requires strictly linear Schrödinger propagation without arbitrary collapse postulates; all superposition branches exist objectively in Hilbert space.',
      colorTheme: '#F59E0B',
    },
    maxTurns: 12,
  },
];

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [topic, setTopic] = useState(PRESETS[0].topic);
  const [maxTurns, setMaxTurns] = useState(PRESETS[0].maxTurns);

  const [agentAName, setAgentAName] = useState(PRESETS[0].agentA.name);
  const [agentAPremise, setAgentAPremise] = useState(PRESETS[0].agentA.corePremise);

  const [agentBName, setAgentBName] = useState(PRESETS[0].agentB.name);
  const [agentBPremise, setAgentBPremise] = useState(PRESETS[0].agentB.corePremise);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    setTopic(p.topic);
    setMaxTurns(p.maxTurns);
    setAgentAName(p.agentA.name);
    setAgentAPremise(p.agentA.corePremise);
    setAgentBName(p.agentB.name);
    setAgentBPremise(p.agentB.corePremise);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSession({
      topic,
      maxTurns,
      agentConfig: {
        agentA: {
          name: agentAName,
          corePremise: agentAPremise,
          colorTheme: '#6366F1',
        },
        agentB: {
          name: agentBName,
          corePremise: agentBPremise,
          colorTheme: '#F59E0B',
        },
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D111C] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configure Dialectic Experiment</h2>
              <p className="text-xs text-slate-400">
                Setup autonomous counter-agents, core premises, and turn horizons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 block">
            Select Preset Scenarios:
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedPreset === idx
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-900/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{preset.title}</div>
                <div className="text-[10px] text-slate-500 mt-1">{preset.maxTurns} turns</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Dialectic Discourse Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Monoliths vs Microservices..."
            />
          </div>

          {/* Turn Limit */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Max Deliberation Turns
            </label>
            <input
              type="number"
              min={4}
              max={30}
              value={maxTurns}
              onChange={(e) => setMaxTurns(parseInt(e.target.value, 10))}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Agent Configurations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Agent A Box */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                Agent A (Thesis)
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Agent Name</label>
                <input
                  type="text"
                  value={agentAName}
                  onChange={(e) => setAgentAName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Foundational Core Premise</label>
                <textarea
                  rows={3}
                  value={agentAPremise}
                  onChange={(e) => setAgentAPremise(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            {/* Agent B Box */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Agent B (Antithesis)
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Agent Name</label>
                <input
                  type="text"
                  value={agentBName}
                  onChange={(e) => setAgentBName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Foundational Core Premise</label>
                <textarea
                  rows={3}
                  value={agentBPremise}
                  onChange={(e) => setAgentBPremise(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Experiment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
