export interface TeamStats {
  team: string;
  nickname: string;
  epa: number;
  zScore: number;
  bps: number;
  accuracy: number;
  a_hubPoints: number;
  a_hubVar: number; // Auto Hub Standard Deviation
  t_hubPoints: number;
  t_hubVar: number; // Teleop Hub Standard Deviation
  T_OZ_Ferry: number;
  T_NZ_Ferry: number;
  end_Climb: string;
  a_climbPoints: number; // Average Auto Climb Points
  a_climbVar: number; // Standard Deviation of Auto Climb
  end_climbPoints: number; // Average End Climb Points
  end_climbVar: number; // Standard Deviation of End Climb
  climb_specialist: number;
}

export interface MatchRecord {
  key: string;
  match_number: number;
  team_key: string;
  alliance: 'red' | 'blue';
  r1: string;
  r2: string;
  r3: string;
  b1: string;
  b2: string;
  b3: string;
  a_hubPoints: number;
  t_hubPoints: number;
  a_climbPoints: number;
  end_climbPoints: number;
}

export interface RPData {
  winRPProb: number;
  hub100Prob: number;
  hub360Prob: number;
  climb50Prob: number;
  expectedRPs: number;
}

export interface AllianceBreakdown {
  autoHub: number;
  autoClimb: number;
  teleopHub: number;
  endClimb: number;
  total: number;
  rpData: RPData;
  // Standard deviations for alliance in each phase (Right Triangle Rule)
  sds: {
    autoHub: number;
    autoClimb: number;
    teleopHub: number;
    endClimb: number;
    total: number;
  };
  // Win probabilities for each specific phase (Red win probability)
  probs: {
    autoHub: number;
    autoClimb: number;
    teleopHub: number;
    endClimb: number;
  };
}

export interface MatchPrediction {
  matchKey: string;
  matchNumber: number;
  redAlliance: string[];
  blueAlliance: string[];
  redPredictedScore: number;
  bluePredictedScore: number;
  winningAlliance: 'red' | 'blue';
  winProbability: number;
  redBreakdown: AllianceBreakdown;
  blueBreakdown: AllianceBreakdown;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  TEAMS = 'TEAMS',
  MATCHES = 'MATCHES',
  RANKINGS = 'RANKINGS'
}