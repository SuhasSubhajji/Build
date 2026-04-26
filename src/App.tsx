import React, { useState, useEffect } from 'react';
import { GlobeMap } from './components/GlobeMap';
import { LocationPanel } from './components/GlobeOverlay';
import { PRIGauge } from './components/PRIGauge';
import { DomainCard } from './components/DomainCard';
import { RiskAnalysis, UserProfile, AgentLog } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Shield, Loader2, AlertTriangle, CheckCircle2, Search, History, Trash2, Navigation, User, FileText } from 'lucide-react';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';
import { runSUTRAAnalysis } from './services/ai';

type Screen = 'globe' | 'dashboard' | 'profile' | 'history';

const Starfield = () => {
  const [stars] = useState(() => 
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() < 0.7 ? '1px' : '2px',
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
    }))
  );

  return (
    <div className="absolute inset-0 starfield pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--delay': star.delay,
            '--duration': star.duration,
          } as any}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('globe');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AgentLog[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<RiskAnalysis | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "John Doe",
    age: 32,
    nationality: "USA",
    healthConditions: [],
    travelPrefs: ["Solo", "Adventure"],
    isVerified: false
  });
  const [analysisProtocolChoice, setAnalysisProtocolChoice] = useState<{ purpose: string; concern: string } | null>(null);
  const [showProtocolChoice, setShowProtocolChoice] = useState(false);

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setSelectedLocation({ lat, lng, name });
  };

  const startAnalysisProtocol = (data: { purpose: string; concern: string }) => {
    setAnalysisProtocolChoice(data);
    setShowProtocolChoice(true);
  };

  const runAnalysis = async (updateProfile: boolean) => {
    if (!selectedLocation || !analysisProtocolChoice) return;
    
    setShowProtocolChoice(false);

    if (updateProfile) {
      setScreen('profile');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress([
      { id: '1', analysisId: 'temp', agentNumber: 1, status: 'running', message: 'Data Fetcher deployed: Polling WHO, GDACS, and Interpol...', createdAt: new Date().toISOString() }
    ]);

    try {
      const result = await runSUTRAAnalysis(
        selectedLocation,
        analysisProtocolChoice.purpose,
        analysisProtocolChoice.concern,
        userProfile
      );
      
      // Artificial delay for UI dramatic effect
      await new Promise(r => setTimeout(r, 2000));
      
      setAnalysisProgress(prev => [
        ...prev.map(p => ({ ...p, status: 'completed' as const })),
        { id: '2', analysisId: 'temp', agentNumber: 2, status: 'running', message: 'Scorer & Verifier: Normalizing data and applying PRI formula...', createdAt: new Date().toISOString() }
      ]);

      await new Promise(r => setTimeout(r, 3000));
      
      setAnalysisProgress(prev => [
        ...prev.map(p => p.agentNumber === 2 ? { ...p, status: 'completed' as const } : p),
        { id: '3', analysisId: 'temp', agentNumber: 3, status: 'running', message: 'Recommendation Engine: Finalizing personalized travel advisory...', createdAt: new Date().toISOString() }
      ]);

      await new Promise(r => setTimeout(r, 2000));

      setIsAnalyzing(false);
      setScreen('dashboard');
      setCurrentAnalysis(result);

    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      alert("Analysis failed. Please check your Gemini API key.");
    }
  };

  const updateProfileAndAnalyze = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setScreen('globe'); 
    
    if (analysisProtocolChoice) {
      setTimeout(() => {
        runAnalysis(false); 
      }, 500);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0f1e] text-white font-sans">
      <Starfield />
      <AnimatePresence mode="wait">
        {screen === 'globe' && (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            <GlobeMap onLocationSelect={handleLocationSelect} />
            
            {/* HUD Navigation */}
            <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50 pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto cursor-default">
                <div className="w-8 h-8 border-2 border-teal-accent rotate-45 flex items-center justify-center">
                  <div className="w-4 h-4 bg-teal-accent"></div>
                </div>
                <span className="text-xl font-bold tracking-[0.2em] uppercase text-teal-accent">Sutra</span>
              </div>

              {/* Floating Search Hub */}
              <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-auto">
                <div className="glass rounded-full px-6 py-3 flex items-center shadow-2xl">
                  <Search className="w-5 h-5 text-white/30 mr-4" />
                  <input 
                    type="text" 
                    placeholder="Search any city, country, or region..." 
                    className="bg-transparent w-full text-sm outline-none placeholder-white/20 text-white"
                  />
                  <div className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/40 font-mono ml-2">CMD+K</div>
                </div>
              </div>

              <div className="flex gap-4 pointer-events-auto">
                <button 
                  onClick={() => setScreen('history')}
                  className="group relative w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-teal-accent"
                  title="Past Reports"
                >
                  <History className="w-5 h-5" />
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-bold text-teal-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Past Reports
                  </span>
                </button>
                <button 
                  onClick={() => setScreen('profile')}
                  className="group relative w-10 h-10 rounded-full bg-teal-accent/10 border border-teal-accent/20 flex items-center justify-center hover:bg-teal-accent/20 transition-all text-teal-accent"
                  title="My Profile"
                >
                  <User className="w-5 h-5" />
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-bold text-teal-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    My Profile
                  </span>
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-teal-accent rounded-full border-2 border-[#0a0f1e] shadow-[0_0_5px_rgba(0,242,196,0.5)]"></div>
                </button>
              </div>
            </nav>

            {/* Coordinate HUD */}
            <div className="absolute left-8 bottom-8 font-mono text-[10px] text-white/30 tracking-widest space-y-2 opacity-60 z-10">
              <div>SYS_STAT: {isAnalyzing ? 'BUSY' : 'READY'}</div>
              <div>AGENT_CON: ACTIVE</div>
              <div>LAT: {selectedLocation?.lat.toFixed(4) || '--'}</div>
              <div>LNG: {selectedLocation?.lng.toFixed(4) || '--'}</div>
              <div>K_SCALING: 2.0</div>
            </div>

            <div className="absolute right-8 bottom-8 text-right opacity-40 z-10">
              <div className="text-[10px] text-white/50 tracking-widest font-mono mb-1 uppercase text-xs">System for Unified Threat & Risk Analysis</div>
              <div className="text-xs text-white/40 uppercase tracking-[0.2em]">Ver. 4.0.1 - AI Enabled</div>
            </div>
            
            <AnimatePresence>
              {selectedLocation && !isAnalyzing && (
                <LocationPanel 
                  locationName={selectedLocation.name} 
                  onAnalyze={startAnalysisProtocol} 
                />
              )}
            </AnimatePresence>

            {/* Protocol Choice Modal */}
            <AnimatePresence>
              {showProtocolChoice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-md glass p-10 rounded-[40px] border border-white/20 shadow-2xl space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-teal-accent/20 border border-teal-accent/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-teal-accent" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">Security Protocol</h2>
                      <p className="text-white/40 text-sm leading-relaxed">
                        To provide highest accuracy (confidence level), link your identity or update your profile context.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => runAnalysis(true)}
                        className="w-full py-5 bg-teal-accent text-[#0a0f1e] font-bold rounded-2xl shadow-xl hover:bg-[#00f2c4] transition-all flex flex-col items-center"
                      >
                        <span className="text-sm uppercase font-bold tracking-widest">Update Profile</span>
                        <span className="text-[10px] opacity-70 mt-1 uppercase tracking-tighter font-bold">High Confidence Accuracy</span>
                      </button>
                      <button
                        onClick={() => runAnalysis(false)}
                        className="w-full py-5 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all flex flex-col items-center"
                      >
                        <span className="text-sm uppercase font-bold tracking-widest">Continue Anonymous</span>
                        <span className="text-[10px] opacity-40 mt-1 uppercase tracking-tighter">Proceed without updation</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => setShowProtocolChoice(false)}
                      className="w-full text-center text-xs text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]"
                    >
                      Cancel Analysis
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-2xl flex flex-col items-center justify-center p-8"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-teal-400 animate-spin" />
                  <Shield className="absolute inset-0 m-auto w-6 h-6 text-teal-400" />
                </div>
                <h2 className="text-3xl font-light tracking-widest text-white uppercase italic">Analyzing Risk</h2>
                <p className="text-white/40 text-sm">Deploying SUTRA specialized AI agents...</p>
              </div>

              <div className="space-y-4">
                {analysisProgress.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border border-white/5",
                      agent.status === 'running' ? "bg-teal-500/10 border-teal-500/20" : "bg-white/5"
                    )}
                  >
                    {agent.status === 'running' ? (
                      <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    )}
                    <div className="flex-1">
                      <p className={cn("text-sm", agent.status === 'running' ? "text-white" : "text-white/40")}>
                        {agent.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'dashboard' && currentAnalysis && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full overflow-y-auto custom-scrollbar relative bg-[#0a0f1e]/80 backdrop-blur-3xl"
          >
            <div className="max-w-7xl mx-auto px-8 py-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                  <div>
                    <button 
                      onClick={() => setScreen('globe')}
                      className="text-white/30 hover:text-teal-accent mb-6 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] group no-print"
                    >
                      <Navigation className="w-3 h-3 rotate-[-90deg] group-hover:translate-x-[-2px] transition-transform" />
                      Back to Globe Intelligence
                    </button>
                    <div className="flex items-end gap-4">
                      <h1 className="text-5xl font-bold tracking-tight text-white">{currentAnalysis.location}</h1>
                      <div className="mb-2 px-2 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                        Node_Active
                      </div>
                    </div>
                    <p className="text-teal-accent/50 font-bold tracking-[0.3em] uppercase text-[10px] mt-2">Unified Threat & Risk Assessment Report</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 no-print">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          try {
                            window.print();
                          } catch (e) {
                            alert("Printing failed. Please try opening the app in a new tab to export the report.");
                          }
                        }}
                        className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-widest glass no-print"
                      >
                        Export Report
                      </button>
                      <button className="no-print px-8 py-4 bg-teal-accent text-[#0a0f1e] rounded-2xl hover:bg-[#00f2c4] transition-all text-[11px] font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,212,170,0.2)]">
                        Share Intel
                      </button>
                    </div>
                    <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Recommended: Print to PDF</span>
                  </div>
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Left: Score Gauge */}
                <div className="lg:col-span-1 sticky top-12">
                  <div className="bg-[#1a2333]/40 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
                    <PRIGauge score={currentAnalysis.priScore} />
                    
                    <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-xs uppercase tracking-widest">Travel Purpose</span>
                        <span className="text-white font-medium">{currentAnalysis.purpose}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-xs uppercase tracking-widest">Analysis Date</span>
                        <span className="text-white font-medium">{new Date(currentAnalysis.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-xs uppercase tracking-widest">Confidence</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={cn("w-1 h-3 rounded-full", i <= (userProfile.isVerified ? 5 : 4) ? "bg-teal-400" : "bg-white/5")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Domain Details and Recommendations */}
                <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                      Domain Intelligence
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      {currentAnalysis.domainScores.map((score, i) => (
                        <div key={score.domain} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch group">
                          <div className="md:col-span-1">
                            <DomainCard score={score} index={i} />
                          </div>
                          <div className="md:col-span-2 px-6 py-6 bg-[#1a2333]/90 border border-white/20 rounded-2xl flex flex-col justify-center backdrop-blur-md group-hover:bg-[#1f2937] transition-all shadow-xl">
                            <div className="flex justify-between items-start mb-3">
                              <div className="text-teal-accent font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                Intelligence Analysis
                              </div>
                              <a href={score.source.url} target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/10 rounded text-[9px] text-teal-accent hover:text-white hover:bg-teal-accent transition-all uppercase font-mono border border-teal-accent/20">
                                Source: {score.source.name}
                              </a>
                            </div>
                            <p className="text-[15px] text-white leading-relaxed font-medium">{score.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                      Intelligence Sources
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentAnalysis.domainScores.map((score, i) => (
                        <a 
                          key={i}
                          href={score.source.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-all group"
                        >
                          <span className="text-[10px] text-teal-accent font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100">{score.domain}</span>
                          <span className="text-xs text-white font-medium truncate">{score.source.name}</span>
                          <span className="text-[8px] text-white/20 uppercase font-mono mt-auto">Verified Repository</span>
                        </a>
                      ))}
                    </div>
                  </section>

                  {currentAnalysis.incidents.length > 0 && (
                    <section>
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                        Latest Risk Incidents
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {currentAnalysis.incidents.map((incident, idx) => (
                          <div key={idx} className="flex gap-5 p-6 bg-[#1a2333]/90 border border-white/20 rounded-2xl group hover:border-red-500/50 transition-all backdrop-blur-xl shadow-xl">
                            <div className="mt-1.5 w-2.5 h-2.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                            <p className="text-[15px] text-white group-hover:text-red-100 transition-colors leading-relaxed font-medium">{incident}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="bg-[#1a2333]/90 border border-white/10 rounded-3xl p-10 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                      <Shield className="w-64 h-64" />
                    </div>
                     <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 relative z-10">
                        <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                        Personalized AI Directives
                      </h2>
                      <div className="prose prose-invert prose-teal max-w-none prose-base relative z-10 text-white/90">
                        <ReactMarkdown>{currentAnalysis.recommendations || ''}</ReactMarkdown>
                      </div>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full overflow-y-auto custom-scrollbar bg-space-bg"
          >
            <div className="max-w-2xl mx-auto px-8 py-20">
              <button 
                onClick={() => setScreen('globe')}
                className="text-white/30 hover:text-teal-accent mb-12 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] group"
              >
                <Navigation className="w-3 h-3 rotate-[-90deg] group-hover:translate-x-[-2px] transition-transform" />
                Back to Intelligence Control
              </button>

              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[32px] bg-teal-accent/10 border border-teal-accent/30 flex items-center justify-center">
                    <Shield className="w-12 h-12 text-teal-accent" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">Identity Vault</h1>
                    <p className="text-white/40 uppercase text-[10px] tracking-[0.3em] font-bold mt-2">Personal Data Context (Screen 5)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2 block">Full Name</label>
                        <input 
                          type="text" 
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-accent/50 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2 block">Age</label>
                        <input 
                          type="number" 
                          value={userProfile.age}
                          onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value) || 0})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-accent/50 outline-none" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2 block">Nationality</label>
                      <input 
                        type="text" 
                        value={userProfile.nationality}
                        onChange={(e) => setUserProfile({...userProfile, nationality: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-accent/50 outline-none" 
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2 block">Health Conditions (Comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Asthma, Allergies..."
                        value={userProfile.healthConditions.join(', ')}
                        onChange={(e) => setUserProfile({...userProfile, healthConditions: e.target.value.split(',').map(s => s.trim())})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-accent/50 outline-none" 
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-2 block">Travel Preferences</label>
                      <div className="flex flex-wrap gap-2">
                        {["Solo", "Luxury", "Budget", "Family", "Adventure", "Business"].map(pref => {
                          const isActive = userProfile.travelPrefs.includes(pref);
                          return (
                            <button
                              key={pref}
                              onClick={() => {
                                const newPrefs = isActive 
                                  ? userProfile.travelPrefs.filter(p => p !== pref)
                                  : [...userProfile.travelPrefs, pref];
                                setUserProfile({...userProfile, travelPrefs: newPrefs});
                              }}
                              className={cn(
                                "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                                isActive ? "bg-teal-accent border-teal-accent text-[#0a0f1e]" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                              )}
                            >
                              {pref}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <div className="bg-teal-accent/5 border border-teal-accent/20 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className={cn("w-6 h-6", userProfile.isVerified ? "text-teal-accent" : "text-white/20")} />
                          <div>
                            <h3 className="font-bold">Aadhar Verification</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Confidence Tier: High</p>
                          </div>
                        </div>
                        
                        <input 
                          type="text" 
                          placeholder="Enter 12-digit Aadhar Number"
                          value={userProfile.aadharNumber || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserProfile({
                              ...userProfile, 
                              aadharNumber: val,
                              isVerified: val.length === 12
                            });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-teal-accent/50 outline-none font-mono" 
                        />
                        <p className="text-[10px] text-white/30 italic leading-relaxed">
                          Linking your Aadhar provides cryptographic proof of identity, significantly increasing analysis confidence.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => updateProfileAndAnalyze(userProfile)}
                      className="w-full py-5 bg-teal-accent text-[#0a0f1e] font-bold rounded-2xl shadow-xl hover:bg-[#00f2c4] transition-all uppercase tracking-widest text-sm"
                    >
                      Save and Proceed with Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
