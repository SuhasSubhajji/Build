import { RiskDomain } from "./types";

export const DOMAIN_WEIGHTS: Record<RiskDomain, number> = {
  [RiskDomain.Security]: 0.30,
  [RiskDomain.Health]: 0.20,
  [RiskDomain.Environmental]: 0.15,
  [RiskDomain.Infrastructure]: 0.10,
  [RiskDomain.SocioPolitical]: 0.10,
  [RiskDomain.Cultural]: 0.10,
  [RiskDomain.Personal]: 0.05,
};

export const DOMAIN_HALF_LIVES: Record<RiskDomain, number> = {
  [RiskDomain.Security]: 24,
  [RiskDomain.Health]: 300,
  [RiskDomain.Environmental]: 6,
  [RiskDomain.Infrastructure]: 72,
  [RiskDomain.SocioPolitical]: 120,
  [RiskDomain.Cultural]: 0, // static
  [RiskDomain.Personal]: 0, // static
};

export const RISK_LEVELS = [
  { min: 0, max: 19, label: "Minimal", color: "#22c55e", desc: "Enjoy trip with standard precautions" },
  { min: 20, max: 39, label: "Low", color: "#eab308", desc: "Stay alert in urban centres after dark" },
  { min: 40, max: 59, label: "Moderate", color: "#f97316", desc: "Elevated concern" },
  { min: 60, max: 79, label: "High", color: "#ef4444", desc: "Reconsider travel. Register with embassy." },
  { min: 80, max: 100, label: "Critical", color: "#000000", desc: "Avoid all travel. Emergency protocols. Move out." },
];
