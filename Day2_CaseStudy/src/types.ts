export interface Shipment {
  id: string;
  destination: string;
  temperature: number;
  humidity: number;
  riskScore: number;
  hasTemperatureExcursion: boolean;
  lastUpdated: Date;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskClassification {
  level: RiskLevel;
  score: number;
}

export interface AnalysisResult {
  totalShipments: number;
  highRiskShipments: Shipment[];
  temperatureExcursions: Shipment[];
  averageRiskScore: number;
  timestamp: Date;
}
