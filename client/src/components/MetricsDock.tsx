import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Award, Target, Zap, Activity } from 'lucide-react';
import { IAgentReflection, ISession } from '../types';

interface MetricsDockProps {
  reflections: IAgentReflection[];
  session: ISession | null;
  onSelectTurn?: (turnIndex: number) => void;
}

export const MetricsDock: React.FC<MetricsDockProps> = ({
  reflections,
  session,
  onSelectTurn,
}) => {
  const chartData = reflections.map((r) => ({
    turn: `Turn ${r.turnIndex + 1}`,
    turnIndex: r.turnIndex,
    score: Number((r.convergenceScore * 100).toFixed(1)),
    rawScore: r.convergenceScore,
    agent: r.agentId === 'agent_a' ? session?.agentConfig?.agentA?.name || 'Agent A' : session?.agentConfig?.agentB?.name || 'Agent B',
    stance: r.deltaStance,
  }));

  const latestScore = reflections.length > 0 ? reflections[reflections.length - 1].convergenceScore : 0;
  const peakScore = reflections.length > 0 ? Math.max(...reflections.map((r) => r.convergenceScore)) : 0;
  const avgScore = session?.metrics?.avgConvergenceScore || (
    reflections.length > 0
      ? reflections.reduce((acc, r) => acc + r.convergenceScore, 0) / reflections.length
      : 0
  );

  return (
    <div className="bg-[#0B0F19]/90 border border-slate-800/80 rounded-2xl p-4 shadow-2xl flex flex-col lg:flex-row items-center gap-6">
      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-3 w-full lg:w-64 shrink-0">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Score</span>
            <div className="text-lg font-extrabold text-cyan-400 mono-text">
              {(latestScore * 100).toFixed(1)}%
            </div>
          </div>
          <Zap className="w-5 h-5 text-cyan-400/60" />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Peak Convergence</span>
            <div className="text-lg font-extrabold text-emerald-400 mono-text">
              {(peakScore * 100).toFixed(1)}%
            </div>
          </div>
          <Award className="w-5 h-5 text-emerald-400/60" />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Avg Convergence</span>
            <div className="text-lg font-extrabold text-indigo-400 mono-text">
              {(avgScore * 100).toFixed(1)}%
            </div>
          </div>
          <Activity className="w-5 h-5 text-indigo-400/60" />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Agreement Goal</span>
            <div className="text-lg font-extrabold text-amber-400 mono-text">
              &ge; 85.0%
            </div>
          </div>
          <Target className="w-5 h-5 text-amber-400/60" />
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-44 lg:h-48 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Dialectic Convergence Trajectory (Consensus Threshold &ge; 85%)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {chartData.length} Turn Observations Recorded
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Convergence trajectory curve will graph here as turns progress.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="convergenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" />
              <XAxis dataKey="turn" stroke="#64748B" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-indigo-300">{data.turn} ({data.agent})</div>
                        <div className="mono-text text-cyan-400 font-bold">Score: {data.score}%</div>
                        <div className="text-[11px] text-slate-300 italic max-w-xs line-clamp-2">
                          "{data.stance}"
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={85}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'Consensus (85%)', fill: '#10B981', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366F1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#convergenceGradient)"
                activeDot={{
                  r: 6,
                  fill: '#06B6D4',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                  onClick: (_event: any, payload: any) => {
                    if (onSelectTurn && payload?.payload?.turnIndex !== undefined) {
                      onSelectTurn(payload.payload.turnIndex);
                    }
                  },
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
