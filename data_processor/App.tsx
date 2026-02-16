import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { TeamStats, MatchRecord, MatchPrediction, ViewMode } from './types';
import { parseCSV, aggregatePredictions, enrichStatsWithSD } from './services/dataProcessor';
import { getMatchInsight } from './services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
// @ts-ignore: Ignore missing 'recharts' type declarations in this environment (local/dev)

// --- Helper Components ---

const SidebarItem: React.FC<{ 
  label: string; 
  active: boolean; 
  onClick: () => void;
  icon: string;
}> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
      active 
        ? 'bg-indigo-600 text-white' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
    <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
    {children}
  </div>
);

const ComparisonBar: React.FC<{ 
  label: string; 
  redValue: number; 
  redSD: number;
  blueValue: number; 
  blueSD: number;
  redProb: number;
  isTotal?: boolean;
 }> = ({ label, redValue, redSD, blueValue, blueSD, redProb, isTotal = false }) => {
  const total = redValue + blueValue || 1;
  const redPercent = (redValue / total) * 100;
  const probPercent = Math.round(redProb * 100);
  
  return (
    <div className={`mb-6 ${isTotal ? 'p-4 bg-slate-50 rounded-xl border border-slate-100' : ''}`}>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        <span className={isTotal ? 'text-indigo-600' : ''}>{label}</span>
        <span className={redProb > 0.5 ? 'text-red-500' : 'text-blue-500'}>
          {redProb > 0.5 ? `Red ${probPercent}% chance` : `Blue ${100 - probPercent}% chance`}
        </span>
      </div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-sm font-black text-red-600">{redValue.toFixed(1)}</span>
          <span className="text-[10px] font-medium text-red-400">±{redSD.toFixed(1)}</span>
        </div>
        <div className="flex items-baseline space-x-1.5 text-right">
          <span className="text-[10px] font-medium text-blue-400">±{blueSD.toFixed(1)}</span>
          <span className="text-sm font-black text-blue-600">{blueValue.toFixed(1)}</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-slate-200 rounded-full flex overflow-hidden">
        <div 
          className="h-full bg-red-500 transition-all duration-700 ease-out" 
          style={{ width: `${redPercent}%` }}
        />
        <div 
          className="h-full bg-blue-500 transition-all duration-700 ease-out" 
          style={{ width: `${100 - redPercent}%` }}
        />
      </div>
    </div>
  );
};

const MetricCell: React.FC<{ value: number; sd: number; colorClass?: string; isAverage?: boolean }> = ({ value, sd, colorClass = "text-slate-600", isAverage = false }) => (
  <td className={`p-4 whitespace-nowrap ${isAverage ? 'bg-[#f0f4ff]' : 'bg-white group-hover:bg-[#f5f8ff]'}`}>
    <div className="flex items-baseline space-x-1">
      <span className={`text-sm font-bold ${colorClass}`}>{value.toFixed(1)}</span>
      <span className="text-[10px] font-medium text-slate-400">±{sd.toFixed(1)}</span>
    </div>
  </td>
);

const RPProgressBar: React.FC<{ label: string, prob: number, color: 'red' | 'blue' }> = ({ label, prob, color }) => {
  const colorClass = color === 'red' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">
        <span>{label}</span>
        <span>{Math.round(prob * 100)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${prob * 100}%` }}
        />
      </div>
    </div>
  );
}

const MatchInsightPanel: React.FC<{ prediction: MatchPrediction, teamStats: TeamStats[] }> = ({ prediction, teamStats }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    const result = await getMatchInsight(prediction, teamStats);
    setInsight(result);
    setLoading(false);
  }, [prediction, teamStats]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return (
    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center justify-between">
        <span>Strategic Forecast</span>
        {!process.env.API_KEY && <span className="text-[8px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">LOCAL MODE</span>}
      </h4>
      {loading ? (
        <div className="flex items-center space-x-2 py-2">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
          "{insight}"
        </p>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem('frc_teamStats');
    const savedMatches = localStorage.getItem('frc_matches');
    const savedPredictions = localStorage.getItem('frc_predictions');

    if (savedStats) setTeamStats(JSON.parse(savedStats));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedPredictions) setPredictions(JSON.parse(savedPredictions));
  }, []);

  useEffect(() => {
    if (teamStats.length > 0) localStorage.setItem('frc_teamStats', JSON.stringify(teamStats));
    if (matches.length > 0) localStorage.setItem('frc_matches', JSON.stringify(matches));
    if (predictions.length > 0) localStorage.setItem('frc_predictions', JSON.stringify(predictions));
  }, [teamStats, matches, predictions]);

  const clearData = () => {
    if (window.confirm("Are you sure you want to clear all scouting data? This cannot be undone.")) {
      localStorage.clear();
      setTeamStats([]);
      setMatches([]);
      setPredictions([]);
      setViewMode(ViewMode.DASHBOARD);
    }
  };

  const enrichedTeamStats = useMemo(() => {
    return enrichStatsWithSD(teamStats, matches);
  }, [teamStats, matches]);

  const generateAllPredictions = useCallback(() => {
    if (enrichedTeamStats.length && matches.length) {
      const preds = aggregatePredictions(matches, enrichedTeamStats);
      setPredictions(preds);
    }
  }, [enrichedTeamStats, matches]);

  useEffect(() => {
    if (enrichedTeamStats.length > 0 && matches.length > 0 && predictions.length === 0) {
      generateAllPredictions();
    }
  }, [enrichedTeamStats, matches, predictions.length, generateAllPredictions]);

  const handleStatsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      const data = parseCSV(text) as TeamStats[];
      setTeamStats(data);
      setPredictions([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMatchesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      const data = parseCSV(text) as MatchRecord[];
      setMatches(data);
      setPredictions([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const topTeams = useMemo(() => {
    return [...enrichedTeamStats].sort((a, b) => b.epa - a.epa).slice(0, 10);
  }, [enrichedTeamStats]);

  const dashboardStats = useMemo(() => {
    const totalPredictions = predictions.length;
    const redWins = predictions.filter(p => p.winningAlliance === 'red').length;
    const blueWins = totalPredictions - redWins;
    return { totalPredictions, redWins, blueWins };
  }, [predictions]);

  const teamRankings = useMemo(() => {
    const rpMap = new Map<string, { totalRP: number; matches: number }>();
    const statsLookup = new Map(enrichedTeamStats.map(s => [s.team, s]));
    enrichedTeamStats.forEach(t => {
      rpMap.set(t.team, { totalRP: 0, matches: 0 });
    });
    predictions.forEach(p => {
      p.redAlliance.forEach(tKey => {
        const entry = rpMap.get(tKey);
        if (entry) {
          entry.totalRP += p.redBreakdown.rpData.expectedRPs;
          entry.matches += 1;
        }
      });
      p.blueAlliance.forEach(tKey => {
        const entry = rpMap.get(tKey);
        if (entry) {
          entry.totalRP += p.blueBreakdown.rpData.expectedRPs;
          entry.matches += 1;
        }
      });
    });
    return Array.from(rpMap.entries())
      .map(([team, data]) => {
        const teamInfo = statsLookup.get(team);
        return {
          team,
          nickname: teamInfo?.nickname || 'Unknown',
          totalRP: data.totalRP,
          avgRP: data.matches > 0 ? data.totalRP / data.matches : 0,
          matchCount: data.matches
        };
      })
      .sort((a, b) => b.totalRP - a.totalRP);
  }, [predictions, enrichedTeamStats]);

  const teamAverages = useMemo(() => {
    if (enrichedTeamStats.length === 0) return null;
    const n = enrichedTeamStats.length;
    const sum = (key: keyof TeamStats) => enrichedTeamStats.reduce((acc, t) => acc + (t[key] as number || 0), 0);
    const avgAHub = sum('a_hubPoints') / n;
    const avgTHub = sum('t_hubPoints') / n;
    const avgAClimb = sum('a_climbPoints') / n;
    const avgEClimb = sum('end_climbPoints') / n;
    const totalPoints = avgAHub + avgTHub + avgAClimb + avgEClimb;
    const combinedSD = Math.sqrt(
      Math.pow(sum('a_hubVar') / n, 2) +
      Math.pow(sum('t_hubVar') / n, 2) +
      Math.pow(sum('a_climbVar') / n, 2) +
      Math.pow(sum('end_climbVar') / n, 2)
    );
    return {
      epa: sum('epa') / n,
      accuracy: sum('accuracy') / n,
      a_hubPoints: avgAHub,
      a_hubVar: sum('a_hubVar') / n,
      t_hubPoints: avgTHub,
      t_hubVar: sum('t_hubVar') / n,
      a_climbPoints: avgAClimb,
      a_climbVar: sum('a_climbVar') / n,
      end_climbPoints: avgEClimb,
      end_climbVar: sum('end_climbVar') / n,
      totalPoints,
      totalSD: combinedSD
    };
  }, [enrichedTeamStats]);

  const toggleMatchSelection = (key: string) => {
    setSelectedMatch(selectedMatch === key ? null : key);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
            <span className="text-2xl">⚡</span>
            <span>FRC Predictor</span>
          </div>
          {(teamStats.length > 0 || matches.length > 0) && (
            <div className="mt-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standalone Mode</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem label="Overview" icon="📊" active={viewMode === ViewMode.DASHBOARD} onClick={() => setViewMode(ViewMode.DASHBOARD)} />
          <SidebarItem label="Rankings" icon="🏆" active={viewMode === ViewMode.RANKINGS} onClick={() => setViewMode(ViewMode.RANKINGS)} />
          <SidebarItem label="Teams" icon="🛡️" active={viewMode === ViewMode.TEAMS} onClick={() => setViewMode(ViewMode.TEAMS)} />
          <SidebarItem label="Matches" icon="⚔️" active={viewMode === ViewMode.MATCHES} onClick={() => setViewMode(ViewMode.MATCHES)} />
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Team Stats CSV</label>
              <input type="file" accept=".csv" onChange={handleStatsUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Schedule CSV</label>
              <input type="file" accept=".csv" onChange={handleMatchesUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            {enrichedTeamStats.length > 0 && matches.length > 0 && (
              <button onClick={generateAllPredictions} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                Recalculate Predictions
              </button>
            )}
            {(teamStats.length > 0 || matches.length > 0) && (
              <button onClick={clearData} className="w-full py-1 text-slate-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider transition-colors">
                Clear Cached Data
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize">{viewMode.toLowerCase()}</h1>
            <p className="text-slate-500">{enrichedTeamStats.length} teams and {predictions.length} predictions available</p>
          </div>
        </header>

        {viewMode === ViewMode.DASHBOARD && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card title="Top 10 Teams by EPA" className="lg:col-span-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTeams}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="team" tickFormatter={(val) => val.replace('frc','')} />
                    <YAxis />
                    <Tooltip labelFormatter={(val) => `Team ${String(val).replace('frc','')}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="epa" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Alliance Win Distribution">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Red Win', value: dashboardStats.redWins }, { name: 'Blue Win', value: dashboardStats.blueWins }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      <Cell fill="#ef4444" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Upcoming Matches" className="lg:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-4">Match</th>
                      <th className="py-4">Red Alliance</th>
                      <th className="py-4">Blue Alliance</th>
                      <th className="py-4">Winner</th>
                      <th className="py-4">Exp. RPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {predictions.slice(0, 10).map((p) => (
                      <tr key={p.matchKey} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setViewMode(ViewMode.MATCHES); toggleMatchSelection(p.matchKey); }}>
                        <td className="py-4 px-4 font-bold text-slate-700">QM {p.matchNumber}</td>
                        <td className="py-4">
                          <div className="flex space-x-1">
                            {p.redAlliance.map(t => <span key={t} className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">{t.replace('frc','')}</span>)}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-1">
                            {p.blueAlliance.map(t => <span key={t} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">{t.replace('frc','')}</span>)}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${p.winningAlliance === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {p.winningAlliance}
                          </span>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center space-x-2">
                             <span className="text-xs font-bold text-red-600">{p.redBreakdown.rpData.expectedRPs.toFixed(1)}</span>
                             <span className="text-[10px] text-slate-300">|</span>
                             <span className="text-xs font-bold text-blue-600">{p.blueBreakdown.rpData.expectedRPs.toFixed(1)}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {viewMode === ViewMode.RANKINGS && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Team</th>
                    <th className="p-4">Nickname</th>
                    <th className="p-4">Projected Total RP</th>
                    <th className="p-4">Avg RP / Match</th>
                    <th className="p-4">Matches Scheduled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamRankings.map((team, index) => (
                    <tr key={team.team} className="group hover:bg-[#f5f8ff] transition-colors">
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${index < 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-indigo-600">{team.team.replace('frc','')}</td>
                      <td className="p-4 text-slate-600 text-sm truncate max-w-[200px]">{team.nickname}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-black text-slate-900">{team.totalRP.toFixed(1)}</span>
                          <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${Math.min(100, (team.totalRP / (teamRankings[0]?.totalRP || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-indigo-700">{team.avgRP.toFixed(2)}</td>
                      <td className="p-4 text-sm font-medium text-slate-400">{team.matchCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === ViewMode.TEAMS && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-auto shadow-sm max-h-[calc(100vh-200px)] relative">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#f8fafc] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="p-4 min-w-[100px] sticky left-0 z-30 bg-[#f8fafc] border-b border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Team</th>
                  <th className="p-4 min-w-[150px] border-b border-slate-200 bg-[#f8fafc]">Nickname</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">Total Pts</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">EPA</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">Acc%</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">Auto Hub</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">Teleop Hub</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">Auto Climb</th>
                  <th className="p-4 border-b border-slate-200 bg-[#f8fafc]">End Climb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamAverages && (
                  <tr className="bg-[#f0f4ff] font-black text-slate-900 group">
                    <td className="p-4 italic sticky left-0 z-10 bg-[#f0f4ff] border-r border-indigo-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">AVERAGE</td>
                    <td className="p-4 text-xs text-slate-400 bg-[#f0f4ff]">Global Average</td>
                    <MetricCell value={teamAverages.totalPoints} sd={teamAverages.totalSD} colorClass="text-indigo-700" isAverage={true} />
                    <td className="p-4 bg-[#f0f4ff]">{teamAverages.epa.toFixed(1)}</td>
                    <td className="p-4 bg-[#f0f4ff]">{Math.round(teamAverages.accuracy * 100)}%</td>
                    <MetricCell value={teamAverages.a_hubPoints} sd={teamAverages.a_hubVar} isAverage={true} />
                    <MetricCell value={teamAverages.t_hubPoints} sd={teamAverages.t_hubVar} isAverage={true} />
                    <MetricCell value={teamAverages.a_climbPoints} sd={teamAverages.a_climbVar} colorClass="text-emerald-700" isAverage={true} />
                    <MetricCell value={teamAverages.end_climbPoints} sd={teamAverages.end_climbVar} colorClass="text-emerald-700" isAverage={true} />
                  </tr>
                )}
                {enrichedTeamStats.map((team) => {
                  const total = (team.a_hubPoints || 0) + (team.t_hubPoints || 0) + (team.a_climbPoints || 0) + (team.end_climbPoints || 0);
                  const combinedSD = Math.sqrt(Math.pow(team.a_hubVar || 0, 2) + Math.pow(team.t_hubVar || 0, 2) + Math.pow(team.a_climbVar || 0, 2) + Math.pow(team.end_climbVar || 0, 2));
                  return (
                    <tr key={team.team} className="group hover:bg-[#f5f8ff] transition-colors">
                      <td className="p-4 font-bold text-indigo-600 sticky left-0 z-10 bg-white group-hover:bg-[#f5f8ff] transition-colors border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {team.team.replace('frc','')}
                      </td>
                      <td className="p-4 text-slate-600 text-sm truncate max-w-[150px] bg-white group-hover:bg-[#f5f8ff]">{team.nickname}</td>
                      <MetricCell value={total} sd={combinedSD} colorClass="text-indigo-600" />
                      <td className="p-4 font-bold text-slate-800 bg-white group-hover:bg-[#f5f8ff]">{team.epa.toFixed(1)}</td>
                      <td className="p-4 text-sm font-medium text-slate-600 bg-white group-hover:bg-[#f5f8ff]">{Math.round(team.accuracy * 100)}%</td>
                      <MetricCell value={team.a_hubPoints} sd={team.a_hubVar || 0} />
                      <MetricCell value={team.t_hubPoints} sd={team.t_hubVar || 0} />
                      <MetricCell value={team.a_climbPoints || 0} sd={team.a_climbVar || 0} colorClass="text-emerald-600" />
                      <MetricCell value={team.end_climbPoints || 0} sd={team.end_climbVar || 0} colorClass="text-emerald-600" />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === ViewMode.MATCHES && (
          <div className="grid grid-cols-1 gap-4">
            {predictions.length > 0 ? predictions.map((p) => {
              const isSelected = selectedMatch === p.matchKey;
              return (
                <div key={p.matchKey} className={`bg-white border transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md ${isSelected ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200'}`}>
                  <div className="px-6 py-4 flex justify-between items-center cursor-pointer select-none" onClick={() => toggleMatchSelection(p.matchKey)}>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-black text-slate-800 tracking-tight">QM {p.matchNumber}</span>
                    </div>
                    <div className="flex items-center space-x-8">
                       <div className="flex items-center space-x-4">
                         <div className="text-right">
                           <div className="text-[10px] font-bold text-red-400 uppercase">Exp RP: {p.redBreakdown.rpData.expectedRPs.toFixed(1)}</div>
                           <div className="text-lg font-black text-slate-900">{p.redPredictedScore}</div>
                         </div>
                         <div className="text-xs font-black text-slate-300 italic">VS</div>
                         <div className="text-left">
                           <div className="text-[10px] font-bold text-blue-400 uppercase">Exp RP: {p.blueBreakdown.rpData.expectedRPs.toFixed(1)}</div>
                           <div className="text-lg font-black text-slate-900">{p.bluePredictedScore}</div>
                         </div>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-colors ${p.winningAlliance === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                         {p.winningAlliance} {Math.round(p.winProbability * 100)}%
                       </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="px-6 pb-6 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Phase Comparison (±SD)</h4>
                          
                          <ComparisonBar 
                            label="Match Total" 
                            redValue={p.redBreakdown.total} 
                            redSD={p.redBreakdown.sds.total}
                            blueValue={p.blueBreakdown.total} 
                            blueSD={p.blueBreakdown.sds.total}
                            redProb={p.winningAlliance === 'red' ? p.winProbability : 1 - p.winProbability} 
                            isTotal={true}
                          />

                          <ComparisonBar 
                            label="Auto Hub" 
                            redValue={p.redBreakdown.autoHub} 
                            redSD={p.redBreakdown.sds.autoHub}
                            blueValue={p.blueBreakdown.autoHub} 
                            blueSD={p.blueBreakdown.sds.autoHub}
                            redProb={p.redBreakdown.probs.autoHub} 
                          />
                          <ComparisonBar 
                            label="Teleop Hub" 
                            redValue={p.redBreakdown.teleopHub} 
                            redSD={p.redBreakdown.sds.teleopHub}
                            blueValue={p.blueBreakdown.teleopHub} 
                            blueSD={p.blueBreakdown.sds.teleopHub}
                            redProb={p.redBreakdown.probs.teleopHub} 
                          />
                          <ComparisonBar 
                            label="Endgame Climb" 
                            redValue={p.redBreakdown.endClimb} 
                            redSD={p.redBreakdown.sds.endClimb}
                            blueValue={p.blueBreakdown.endClimb} 
                            blueSD={p.blueBreakdown.sds.endClimb}
                            redProb={p.redBreakdown.probs.endClimb} 
                          />
                          
                          <MatchInsightPanel prediction={p} teamStats={enrichedTeamStats} />
                        </div>

                        <div className="space-y-8">
                           <div>
                             <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ranking Point Path</h4>
                             <div className="grid grid-cols-2 gap-8">
                               <div>
                                 <div className="text-[10px] font-black text-red-400 uppercase mb-2">Red (Exp: {p.redBreakdown.rpData.expectedRPs.toFixed(1)})</div>
                                 <RPProgressBar label="Hub RP (100+)" prob={p.redBreakdown.rpData.hub100Prob} color="red" />
                                 <RPProgressBar label="Hub Bonus (360+)" prob={p.redBreakdown.rpData.hub360Prob} color="red" />
                                 <RPProgressBar label="Climb RP (50+)" prob={p.redBreakdown.rpData.climb50Prob} color="red" />
                               </div>
                               <div>
                                 <div className="text-[10px] font-black text-blue-400 uppercase mb-2">Blue (Exp: {p.blueBreakdown.rpData.expectedRPs.toFixed(1)})</div>
                                 <RPProgressBar label="Hub RP (100+)" prob={p.blueBreakdown.rpData.hub100Prob} color="blue" />
                                 <RPProgressBar label="Hub Bonus (360+)" prob={p.blueBreakdown.rpData.hub360Prob} color="blue" />
                                 <RPProgressBar label="Climb RP (50+)" prob={p.blueBreakdown.rpData.climb50Prob} color="blue" />
                               </div>
                             </div>
                           </div>

                           <div className="flex gap-4">
                             <div className="flex-1 bg-red-50/50 p-4 rounded-xl border border-red-100">
                               <div className="text-[10px] font-black text-red-400 uppercase mb-3">Red Alliance</div>
                               <div className="space-y-1.5">{p.redAlliance.map(t => <div key={t} className="text-xs font-bold text-slate-700">{t.replace('frc','')} <span className="text-[9px] font-medium text-slate-400 ml-1">EPA: {enrichedTeamStats.find(s => s.team === t)?.epa.toFixed(1) || '-'}</span></div>)}</div>
                             </div>
                             <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                               <div className="text-[10px] font-black text-blue-400 uppercase mb-3">Blue Alliance</div>
                               <div className="space-y-1.5">{p.blueAlliance.map(t => <div key={t} className="text-xs font-bold text-slate-700">{t.replace('frc','')} <span className="text-[9px] font-medium text-slate-400 ml-1">EPA: {enrichedTeamStats.find(s => s.team === t)?.epa.toFixed(1) || '-'}</span></div>)}</div>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }) : <div className="text-center py-20 text-slate-400 italic">Upload data to view predictions.</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;