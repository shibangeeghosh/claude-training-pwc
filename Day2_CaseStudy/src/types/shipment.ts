export interface Shipment {
  id: string;
  destination: string;
  riskScore: number;
  temperature: number;
  temperatureExcursion: boolean;
  status: string;
  carrier: string;
  departureDate: string;
  estimatedArrival: string;
  productType: string;
}

export interface ShipmentAnalytics {
  totalShipments: number;
  highRiskCount: number;
  temperatureExcursionCount: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}
