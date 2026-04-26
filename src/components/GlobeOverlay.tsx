import React, { useState } from 'react';
import { Search, MapPin, Navigation, User, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LocationPanelProps {
  locationName: string;
  onAnalyze: (data: { purpose: string; concern: string }) => void;
}

export const LocationPanel: React.FC<LocationPanelProps> = ({ locationName, onAnalyze }) => {
  const [purpose, setPurpose] = useState('Tourism');
  const [concern, setConcern] = useState('');

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
    >
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">{locationName}</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">SUTRA Visualization Node • Active</p>
          </div>
          <div className="bg-teal-accent/10 px-3 py-1 rounded-full border border-teal-accent/30">
            <span className="text-[10px] text-teal-accent font-bold uppercase tracking-tighter">PRI INDEX: --</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2 block">Purpose of Visit</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/20 transition-all appearance-none cursor-pointer"
            >
              {['Tourism', 'Business', 'Transit', 'Study', 'Relocation', 'Emergency', 'Other'].map(p => (
                <option key={p} value={p} className="bg-[#1a2333]">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2 block">Specific Concern</label>
            <input
              type="text"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder="e.g. solo travel, medical access..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-accent/50 focus:ring-1 focus:ring-teal-accent/20 transition-all placeholder:text-white/20"
            />
          </div>

          <button
            onClick={() => onAnalyze({ purpose, concern })}
            className="w-full bg-teal-accent hover:bg-[#00f2c4] text-[#0a0f1e] font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,212,170,0.3)] transition-all flex items-center justify-center gap-2 mt-2 group"
          >
            ANALYSE RISK
            <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
