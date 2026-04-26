import React from 'react';
import { Shield, Activity, Cloud, Zap, Scale, Globe, User } from 'lucide-react';
import { RiskDomain, DomainScore } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const domainIcons: Record<RiskDomain, any> = {
  [RiskDomain.Security]: Shield,
  [RiskDomain.Health]: Activity,
  [RiskDomain.Environmental]: Cloud,
  [RiskDomain.Infrastructure]: Zap,
  [RiskDomain.SocioPolitical]: Scale,
  [RiskDomain.Cultural]: Globe,
  [RiskDomain.Personal]: User,
};

export const DomainCard: React.FC<{ score: DomainScore; index: number }> = ({ score, index }) => {
  const Icon = domainIcons[score.domain] || Shield;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#1a2333]/80 border border-white/10 rounded-2xl p-6 hover:bg-[#1a2333] transition-all group backdrop-blur-xl shadow-lg"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 rounded-2xl group-hover:bg-teal-500/20 transition-colors border border-teal-500/20">
            <Icon className="w-6 h-6 text-teal-accent" />
          </div>
          <div>
            <h3 className="text-white font-bold capitalize text-lg tracking-tight">{score.domain}</h3>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">Domain ID: {index + 1}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white tracking-tighter">{(score.r * 10).toFixed(1)}</div>
          <div className="text-[10px] text-white/30 tracking-tight flex flex-col font-mono">
            <span className="not-italic opacity-60">RAW_VAL: {score.value}</span>
            <span className="uppercase text-[8px] opacity-40">{score.unit}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score.r * 100}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/20">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 hover:text-white/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              P_FACT: {score.p.toFixed(1)}x
            </span>
            <span className="flex items-center gap-1.5 hover:text-white/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              T_DECAY: {score.t.toFixed(1)}
            </span>
          </div>
          <div className="px-2 py-0.5 rounded border border-white/5 text-white/40">
            W: {Math.round(score.weight * 100)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};
