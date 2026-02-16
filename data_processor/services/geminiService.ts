import { GoogleGenAI } from "@google/genai";
import { TeamStats, MatchPrediction } from "../types";

/**
 * Generates a high-quality strategic summary locally. 
 * This ensures the app is fully functional even without the Gemini API.
 */
const getLocalMatchInsight = (prediction: MatchPrediction): string => {
  const winner = prediction.winningAlliance.toUpperCase();
  const diff = Math.abs(prediction.redPredictedScore - prediction.bluePredictedScore);
  const confidence = Math.round(prediction.winProbability * 100);
  
  const redRP = prediction.redBreakdown.rpData;
  const blueRP = prediction.blueBreakdown.rpData;

  let insights: string[] = [];

  // Hub Analysis
  if (prediction.redBreakdown.autoHub + prediction.redBreakdown.teleopHub > prediction.blueBreakdown.autoHub + prediction.blueBreakdown.teleopHub + 40) {
    insights.push("Red dominates the Hub scoring phase.");
  } else if (prediction.blueBreakdown.autoHub + prediction.blueBreakdown.teleopHub > prediction.redBreakdown.autoHub + prediction.redBreakdown.teleopHub + 40) {
    insights.push("Blue holds a significant Hub scoring advantage.");
  }

  // RP Reliability
  if (redRP.hub360Prob > 0.7 && blueRP.hub360Prob < 0.3) {
    insights.push("Red is highly likely to secure the Bonus Hub RP.");
  }
  if (redRP.climb50Prob > 0.8 && blueRP.climb50Prob > 0.8) {
    insights.push("Both alliances show high climb reliability.");
  } else if (redRP.climb50Prob < 0.4 && blueRP.climb50Prob < 0.4) {
    insights.push("Climb RP is at risk for both alliances; endgame performance is critical.");
  }

  // Score Margin
  if (diff < 15) {
    insights.push("Expect a toss-up; penalties or single missed cycles will decide the outcome.");
  } else {
    insights.push(`${winner} is favored by ${diff.toFixed(1)} points.`);
  }

  return `[Strategic Forecast] ${insights.join(" ")} (${confidence}% confidence).`;
};

export const getMatchInsight = async (
  prediction: MatchPrediction,
  teamStats: TeamStats[]
): Promise<string> => {
  // Use local analysis if API key is missing or not provided
  if (!process.env.API_KEY) {
    return getLocalMatchInsight(prediction);
  }

  const statsMap = new Map(teamStats.map(s => [s.team, s]));
  const getBriefStats = (team: string) => {
    const s = statsMap.get(team);
    if (!s) return `${team}: No data`;
    return `${team} (${s.nickname}): EPA=${s.epa.toFixed(1)}, Auto=${s.a_climbPoints.toFixed(1)}, End=${s.end_climbPoints.toFixed(1)}`;
  };

  const redBrief = prediction.redAlliance.map(getBriefStats).join('\n');
  const blueBrief = prediction.blueAlliance.map(getBriefStats).join('\n');

  const prompt = `
    Act as an FRC strategy analyst. Provide a short, tactical 2-sentence breakdown for this match:
    Match: ${prediction.matchKey}
    
    RED ALLIANCE:
    ${redBrief}
    Expected RPs: ${prediction.redBreakdown.rpData.expectedRPs.toFixed(1)}
    
    BLUE ALLIANCE:
    ${blueBrief}
    Expected RPs: ${prediction.blueBreakdown.rpData.expectedRPs.toFixed(1)}
    
    Predicted Winner: ${prediction.winningAlliance.toUpperCase()}
    Confidence: ${Math.round(prediction.winProbability * 100)}%
    
    Focus on key strengths like Hub consistency or Ranking Point paths.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || getLocalMatchInsight(prediction);
  } catch (error) {
    return getLocalMatchInsight(prediction);
  }
};