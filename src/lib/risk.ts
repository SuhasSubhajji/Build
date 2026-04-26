import { RiskDomain, DomainScore, UserProfile } from '../types';
import { DOMAIN_WEIGHTS, DOMAIN_HALF_LIVES } from '../constants';

export const calculatePRI = (domainScores: DomainScore[], k = 2.0): number => {
  const x = k * domainScores.reduce((sum, d) => {
    return sum + (d.weight * d.r * d.p * d.c * d.t);
  }, 0);

  // Approximation regime switching as per user formula
  if (x <= 0.3) {
    return 100 * x;
  } else if (x <= 0.9) {
    return 100 * (x - Math.pow(x, 2) / 2);
  } else if (x <= 1.8) {
    return 100 * (x - Math.pow(x, 2) / 2 + Math.pow(x, 3) / 6);
  } else {
    // Exact
    return 100 * (1 - Math.exp(-x));
  }
};

export const calculateTemporalDecay = (domain: RiskDomain, retrievedAt: string): number => {
  const halfLife = DOMAIN_HALF_LIVES[domain];
  if (halfLife === 0) return 1.0;

  const dtHours = (new Date().getTime() - new Date(retrievedAt).getTime()) / (1000 * 60 * 60);
  const lambda = Math.log(2) / halfLife;
  const t = Math.exp(-lambda * dtHours);
  
  return Math.max(t, 0.01);
};

export const getPersonalizationFactor = (domain: RiskDomain, profile: UserProfile): number => {
  let p = 1.0;
  
  // Simple heuristic logic for personalization
  if (domain === RiskDomain.Personal) {
    if (profile.healthConditions.length > 0) p *= 1.5;
    if (profile.travelPrefs.includes('Solo travel')) p *= 1.2;
  }
  
  if (domain === RiskDomain.Security) {
    if (profile.age < 21 || profile.age > 70) p *= 1.3;
  }

  return Math.min(Math.max(p, 0.5), 2.0);
};

export const normalizeRawScore = (domain: RiskDomain, value: number): number => {
  const limits: Record<RiskDomain, { min: number; max: number }> = {
    [RiskDomain.Security]: { min: 0, max: 50 },
    [RiskDomain.Health]: { min: 0, max: 500 },
    [RiskDomain.Environmental]: { min: 0, max: 500 },
    [RiskDomain.Infrastructure]: { min: 0, max: 300 },
    [RiskDomain.SocioPolitical]: { min: 0, max: 72 },
    [RiskDomain.Cultural]: { min: 0, max: 20 },
    [RiskDomain.Personal]: { min: 1, max: 8 },
  };

  const { min, max } = limits[domain];
  const r = (value - min) / (max - min);
  return Math.min(Math.max(r, 0), 1);
};
