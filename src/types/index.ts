export interface UserProfile {
  name: string;
  age: number;
  gender?: string;
  nationality: string;
  religion?: string;
  healthConditions: string[];
  travelPrefs: string[];
  aadharNumber?: string;
  isVerified: boolean;
}

export enum RiskDomain {
  Security = "security",
  Health = "health",
  Environmental = "environmental",
  Infrastructure = "infrastructure",
  SocioPolitical = "socioPolitical",
  Cultural = "cultural",
  Personal = "personal",
}

export interface DomainScore {
  domain: RiskDomain;
  r: number; // raw normalized [0, 1]
  p: number; // personalization [0.5, 2.0]
  c: number; // confidence [0.5, 1.0]
  t: number; // temporal decay [0.01, 1.0]
  weight: number;
  value: number; // raw value
  unit: string;
  explanation: string;
  source: {
    name: string;
    url: string;
  };
}

export interface RiskAnalysis {
  id: string;
  location: string;
  lat: number;
  lng: number;
  purpose: string;
  specificConcern?: string;
  priScore: number;
  domainScores: DomainScore[];
  recommendations: string;
  incidents: string[];
  createdAt: string;
}

export interface AgentLog {
  id: string;
  analysisId: string;
  agentNumber: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  createdAt: string;
}
