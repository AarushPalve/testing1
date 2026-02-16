import { TeamStats, MatchRecord, MatchPrediction, AllianceBreakdown, RPData } from '../types';

/**
 * Standard Error Function approximation (erf)
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = (x < 0) ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function (Phi)
 * Phi(z) = 1/2 * (1 + erf(z / sqrt(2)))
 */
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/**
 * Global noise term for match margin variance.
 */
const VAR_NOISE = 120;

/**
 * Noise terms for Ranking Point calculations
 */
const HUB_RP_TAU = 80;
const CLIMB_RP_TAU = 10;

/**
 * Calculates the probability that alliance A wins against alliance B.
 * Formula: Phi((meanA - meanB) / sqrt(sdA^2 + sdB^2 + noise))
 */
function calculateWinProbability(meanA: number, sdA: number, meanB: number, sdB: number): number {
  const meanDiff = meanA - meanB;
  const combinedVariance = Math.pow(sdA, 2) + Math.pow(sdB, 2) + Math.pow(VAR_NOISE, 2);
  const combinedSD = Math.sqrt(combinedVariance);
  
  if (combinedSD === 0) return meanDiff > 0 ? 1 : (meanDiff < 0 ? 0 : 0.5);
  
  const z = meanDiff / combinedSD;
  return normalCDF(z);
}

/**
 * Calculates the probability of an alliance crossing a threshold.
 * P(Value >= Threshold) = Phi((Mean - Threshold) / sqrt(SD^2 + Tau^2))
 */
function calculateThresholdProbability(mean: number, sd: number, threshold: number, tau: number): number {
  const combinedVariance = Math.pow(sd, 2) + Math.pow(tau, 2);
  const combinedSD = Math.sqrt(combinedVariance);
  
  if (combinedSD === 0) return mean >= threshold ? 1 : 0;
  
  const z = (mean - threshold) / combinedSD;
  return normalCDF(z);
}

export const parseCSV = (csv: string): any[] => {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const row: any = {};
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    headers.forEach((header, index) => {
      let val = values[index]?.trim();
      if (val !== '' && !isNaN(Number(val))) {
        row[header] = Number(val);
      } else {
        row[header] = val;
      }
    });
    results.push(row);
  }
  return results;
};

const normalizeTeamKey = (key: any): string => {
  if (key === undefined || key === null) return '';
  const s = String(key).trim();
  if (s === '') return '';
  if (!s.toLowerCase().startsWith('frc')) {
    return `frc${s}`;
  }
  return s.toLowerCase();
};

export const enrichStatsWithSD = (
  stats: TeamStats[],
  matches: MatchRecord[]
): TeamStats[] => {
  if (!matches || matches.length === 0) return stats;

  const teamMatches = new Map<string, MatchRecord[]>();
  matches.forEach(m => {
    const team = normalizeTeamKey(m.team_key);
    if (!team) return;
    if (!teamMatches.has(team)) teamMatches.set(team, []);
    teamMatches.get(team)!.push(m);
  });

  const calculateMean = (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const calculateSampleSD = (values: number[]) => {
    if (values.length < 2) return 0;
    const mean = calculateMean(values);
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const sumSquareDiffs = squareDiffs.reduce((a, b) => a + b, 0);
    return Math.sqrt(sumSquareDiffs / (values.length - 1));
  };

  return stats.map(s => {
    const normalizedSKey = normalizeTeamKey(s.team);
    const matchesForTeam = teamMatches.get(normalizedSKey) || [];
    if (matchesForTeam.length === 0) return { ...s, team: normalizedSKey };

    const aHubVals = matchesForTeam.map(m => m.a_hubPoints || 0);
    const tHubVals = matchesForTeam.map(m => m.t_hubPoints || 0);
    const aClimbVals = matchesForTeam.map(m => m.a_climbPoints || 0);
    const endClimbVals = matchesForTeam.map(m => m.end_climbPoints || 0);

    return {
      ...s,
      team: normalizedSKey,
      a_hubPoints: calculateMean(aHubVals),
      t_hubPoints: calculateMean(tHubVals),
      a_climbPoints: calculateMean(aClimbVals),
      end_climbPoints: calculateMean(endClimbVals),
      a_hubVar: calculateSampleSD(aHubVals),
      t_hubVar: calculateSampleSD(tHubVals),
      a_climbVar: calculateSampleSD(aClimbVals),
      end_climbVar: calculateSampleSD(endClimbVals)
    };
  });
};

export const aggregatePredictions = (
  matches: MatchRecord[],
  stats: TeamStats[]
): MatchPrediction[] => {
  const groupedMatches = new Map<string, MatchRecord[]>();
  matches.forEach(m => {
    const matchKey = m.key || `m${m.match_number}`;
    if (!groupedMatches.has(matchKey)) {
      groupedMatches.set(matchKey, []);
    }
    groupedMatches.get(matchKey)!.push(m);
  });

  const statsMap = new Map<string, TeamStats>();
  stats.forEach(s => statsMap.set(normalizeTeamKey(s.team), s));

  const predictions: MatchPrediction[] = [];

  groupedMatches.forEach((matchTeamRecords, key) => {
    const first = matchTeamRecords[0];
    const redTeams = [first.r1, first.r2, first.r3].map(normalizeTeamKey).filter(t => t !== 'frc');
    const blueTeams = [first.b1, first.b2, first.b3].map(normalizeTeamKey).filter(t => t !== 'frc');

    if (redTeams.length === 0 && blueTeams.length === 0) return;

    const getAllianceStats = (teams: string[]) => {
      const metrics = {
        autoHub: { mean: 0, var: 0 },
        autoClimb: { mean: 0, var: 0 },
        teleopHub: { mean: 0, var: 0 },
        endClimb: { mean: 0, var: 0 },
        total: { mean: 0, var: 0 },
        hubCombined: { mean: 0, var: 0 },
        climbCombined: { mean: 0, var: 0 }
      };

      teams.forEach(t => {
        const s = statsMap.get(t);
        if (s) {
          metrics.autoHub.mean += s.a_hubPoints || 0;
          metrics.autoHub.var += Math.pow(s.a_hubVar || 0, 2);

          metrics.autoClimb.mean += s.a_climbPoints || 0;
          metrics.autoClimb.var += Math.pow(s.a_climbVar || 0, 2);

          metrics.teleopHub.mean += s.t_hubPoints || 0;
          metrics.teleopHub.var += Math.pow(s.t_hubVar || 0, 2);

          metrics.endClimb.mean += s.end_climbPoints || 0;
          metrics.endClimb.var += Math.pow(s.end_climbVar || 0, 2);
        }
      });

      metrics.total.mean = metrics.autoHub.mean + metrics.autoClimb.mean + metrics.teleopHub.mean + metrics.endClimb.mean;
      metrics.total.var = metrics.autoHub.var + metrics.autoClimb.var + metrics.teleopHub.var + metrics.endClimb.var;
      
      metrics.hubCombined.mean = metrics.autoHub.mean + metrics.teleopHub.mean;
      metrics.hubCombined.var = metrics.autoHub.var + metrics.teleopHub.var;

      metrics.climbCombined.mean = metrics.autoClimb.mean + metrics.endClimb.mean;
      metrics.climbCombined.var = metrics.autoClimb.var + metrics.endClimb.var;

      return metrics;
    };

    const redStats = getAllianceStats(redTeams);
    const blueStats = getAllianceStats(blueTeams);

    const redWinProb = calculateWinProbability(redStats.total.mean, Math.sqrt(redStats.total.var), blueStats.total.mean, Math.sqrt(blueStats.total.var));

    const buildBreakdown = (stats: any, opponentStats: any, isRed: boolean): AllianceBreakdown => {
      const winProb = isRed ? redWinProb : 1 - redWinProb;
      
      const hub100Prob = calculateThresholdProbability(stats.hubCombined.mean, Math.sqrt(stats.hubCombined.var), 100, HUB_RP_TAU);
      const hub360Prob = calculateThresholdProbability(stats.hubCombined.mean, Math.sqrt(stats.hubCombined.var), 360, HUB_RP_TAU);
      const climb50Prob = calculateThresholdProbability(stats.climbCombined.mean, Math.sqrt(stats.climbCombined.var), 50, CLIMB_RP_TAU);
      
      const expectedRPs = (winProb * 3) + (hub100Prob * 1) + (hub360Prob * 1) + (climb50Prob * 1);

      return {
        autoHub: stats.autoHub.mean,
        autoClimb: stats.autoClimb.mean,
        teleopHub: stats.teleopHub.mean,
        endClimb: stats.endClimb.mean,
        total: stats.total.mean,
        rpData: {
          winRPProb: winProb,
          hub100Prob,
          hub360Prob,
          climb50Prob,
          expectedRPs
        },
        sds: {
          autoHub: Math.sqrt(stats.autoHub.var),
          autoClimb: Math.sqrt(stats.autoClimb.var),
          teleopHub: Math.sqrt(stats.teleopHub.var),
          endClimb: Math.sqrt(stats.endClimb.var),
          total: Math.sqrt(stats.total.var)
        },
        probs: {
          autoHub: isRed 
            ? calculateWinProbability(stats.autoHub.mean, Math.sqrt(stats.autoHub.var), opponentStats.autoHub.mean, Math.sqrt(opponentStats.autoHub.var))
            : calculateWinProbability(opponentStats.autoHub.mean, Math.sqrt(opponentStats.autoHub.var), stats.autoHub.mean, Math.sqrt(stats.autoHub.var)),
          autoClimb: isRed 
            ? calculateWinProbability(stats.autoClimb.mean, Math.sqrt(stats.autoClimb.var), opponentStats.autoClimb.mean, Math.sqrt(opponentStats.autoClimb.var))
            : calculateWinProbability(opponentStats.autoClimb.mean, Math.sqrt(opponentStats.autoClimb.var), stats.autoClimb.mean, Math.sqrt(stats.autoClimb.var)),
          teleopHub: isRed 
            ? calculateWinProbability(stats.teleopHub.mean, Math.sqrt(stats.teleopHub.var), opponentStats.teleopHub.mean, Math.sqrt(opponentStats.teleopHub.var))
            : calculateWinProbability(opponentStats.teleopHub.mean, Math.sqrt(opponentStats.teleopHub.var), stats.teleopHub.mean, Math.sqrt(stats.teleopHub.var)),
          endClimb: isRed 
            ? calculateWinProbability(stats.endClimb.mean, Math.sqrt(stats.endClimb.var), opponentStats.endClimb.mean, Math.sqrt(opponentStats.endClimb.var))
            : calculateWinProbability(opponentStats.endClimb.mean, Math.sqrt(opponentStats.endClimb.var), stats.endClimb.mean, Math.sqrt(stats.endClimb.var)),
        }
      };
    };

    predictions.push({
      matchKey: key,
      matchNumber: first.match_number,
      redAlliance: redTeams,
      blueAlliance: blueTeams,
      redPredictedScore: Number(redStats.total.mean.toFixed(1)),
      bluePredictedScore: Number(blueStats.total.mean.toFixed(1)),
      winningAlliance: redStats.total.mean >= blueStats.total.mean ? 'red' : 'blue',
      winProbability: Number((redStats.total.mean >= blueStats.total.mean ? redWinProb : 1 - redWinProb).toFixed(4)),
      redBreakdown: buildBreakdown(redStats, blueStats, true),
      blueBreakdown: buildBreakdown(blueStats, redStats, false)
    });
  });

  return predictions.sort((a, b) => a.matchNumber - b.matchNumber);
};