import { Shipment, RiskLevel, RiskClassification } from '../types';

const TEMPERATURE_MIN = 2;
const TEMPERATURE_MAX = 8;
const HUMIDITY_MIN = 30;
const HUMIDITY_MAX = 70;

export const calculateRiskScore = (shipment: Shipment): number => {
  let riskScore = 0;

  const temperatureExcursion = shipment.temperature < TEMPERATURE_MIN ||
                                shipment.temperature > TEMPERATURE_MAX;

  if (temperatureExcursion) {
    const tempDeviation = shipment.temperature < TEMPERATURE_MIN
      ? TEMPERATURE_MIN - shipment.temperature
      : shipment.temperature - TEMPERATURE_MAX;

    const tempRisk = Math.min(tempDeviation * 10, 50);
    riskScore += tempRisk;
  }

  const humidityExcursion = shipment.humidity < HUMIDITY_MIN ||
                            shipment.humidity > HUMIDITY_MAX;

  if (humidityExcursion) {
    const humidityDeviation = shipment.humidity < HUMIDITY_MIN
      ? HUMIDITY_MIN - shipment.humidity
      : shipment.humidity - HUMIDITY_MAX;

    const humidityRisk = Math.min(humidityDeviation * 2, 30);
    riskScore += humidityRisk;
  }

  const daysOld = (Date.now() - shipment.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld > 7) {
    riskScore += Math.min(daysOld * 2, 20);
  }

  return Math.min(riskScore, 100);
};

export const classifyRisk = (score: number): RiskLevel => {
  if (score <= 35) {
    return 'low';
  } else if (score <= 70) {
    return 'medium';
  } else {
    return 'high';
  }
};

export const identifyHighRisk = (shipments: Shipment[]): Shipment[] => {
  return shipments.filter(shipment => shipment.riskScore > 70);
};

export const identifyTemperatureExcursions = (shipments: Shipment[]): Shipment[] => {
  return shipments.filter(shipment =>
    shipment.temperature < TEMPERATURE_MIN ||
    shipment.temperature > TEMPERATURE_MAX
  );
};

export const getTopRiskyShipments = (shipments: Shipment[], count: number): Shipment[] => {
  return [...shipments]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, count);
};

export const getAverageRiskScore = (shipments: Shipment[]): number => {
  if (shipments.length === 0) {
    return 0;
  }
  const total = shipments.reduce((sum, shipment) => sum + shipment.riskScore, 0);
  return total / shipments.length;
};

export const getCommonDestinations = (shipments: Shipment[]): Record<string, number> => {
  const destinationCounts: Record<string, number> = {};

  shipments.forEach(shipment => {
    destinationCounts[shipment.destination] = (destinationCounts[shipment.destination] || 0) + 1;
  });

  return destinationCounts;
};

export const getRiskBreakdown = (shipments: Shipment[]): Record<RiskLevel, number> => {
  const breakdown: Record<RiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0
  };

  shipments.forEach(shipment => {
    const level = classifyRisk(shipment.riskScore);
    breakdown[level]++;
  });

  return breakdown;
};
