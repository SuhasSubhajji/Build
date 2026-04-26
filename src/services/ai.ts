import { UserProfile, RiskAnalysis, DomainScore } from "../types";

export async function runSUTRAAnalysis(
  location: { name: string; lat: number; lng: number },
  purpose: string,
  specificConcern: string,
  userProfile: UserProfile
): Promise<RiskAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, purpose, specificConcern, userProfile })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Analysis request failed");
  }
  
  const analysisData = await response.json();
  
  return {
    id: Math.random().toString(36).substring(7),
    location: location.name,
    lat: location.lat,
    lng: location.lng,
    purpose,
    specificConcern,
    priScore: analysisData.priScore,
    domainScores: analysisData.domainScores,
    recommendations: analysisData.recommendations,
    incidents: analysisData.incidents || [],
    createdAt: new Date().toISOString()
  };
}
