import React from 'react';
import { motion } from 'motion/react';
import { RISK_LEVELS } from '../constants';

interface PRIGaugeProps {
  score: number;
}

export const PRIGauge: React.FC<PRIGaugeProps> = ({ score }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const level = RISK_LEVELS.find(l => score >= l.min && score <= l.max) || RISK_LEVELS[0];

  return (
    <div className="relative flex flex-col items-center">
      <svg className="w-64 h-64 -rotate-90">
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="128"
          cy="128"
          r={radius}
          stroke={level.color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          strokeLinecap="round"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl font-bold tracking-tighter text-white"
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">PRI Index</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: level.color + '20', color: level.color }}>
          {level.label}
        </div>
        <p className="text-white/60 text-sm max-w-[200px]">{level.desc}</p>
      </motion.div>
    </div>
  );
};
