/**
 * Pharma Shipment Risk Analyzer - Analytics Generator
 * Generates comprehensive shipment analytics using project business logic
 */

const fs = require('fs');

// Constants from business logic
const TEMPERATURE_MIN = 2;
const TEMPERATURE_MAX = 8;
const HUMIDITY_MIN = 30;
const HUMIDITY_MAX = 70;

// ===== BUSINESS LOGIC (from riskCalculator.ts) =====
const calculateRiskScore = (shipment) => {
  let riskScore = 0;

  const temperatureExcursion =
    shipment.temperature < TEMPERATURE_MIN ||
    shipment.temperature > TEMPERATURE_MAX;

  if (temperatureExcursion) {
    const tempDeviation =
      shipment.temperature < TEMPERATURE_MIN
        ? TEMPERATURE_MIN - shipment.temperature
        : shipment.temperature - TEMPERATURE_MAX;

    const tempRisk = Math.min(tempDeviation * 10, 50);
    riskScore += tempRisk;
  }

  const humidityExcursion =
    shipment.humidity < HUMIDITY_MIN || shipment.humidity > HUMIDITY_MAX;

  if (humidityExcursion) {
    const humidityDeviation =
      shipment.humidity < HUMIDITY_MIN
        ? HUMIDITY_MIN - shipment.humidity
        : shipment.humidity - HUMIDITY_MAX;

    const humidityRisk = Math.min(humidityDeviation * 2, 30);
    riskScore += humidityRisk;
  }

  const daysOld =
    (Date.now() - shipment.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld > 7) {
    riskScore += Math.min(daysOld * 2, 20);
  }

  return Math.min(riskScore, 100);
};

const classifyRisk = (score) => {
  if (score <= 35) {
    return 'low';
  } else if (score <= 70) {
    return 'medium';
  } else {
    return 'high';
  }
};

const identifyHighRisk = (shipments) => {
  return shipments.filter((shipment) => shipment.riskScore > 70);
};

const identifyTemperatureExcursions = (shipments) => {
  return shipments.filter(
    (shipment) =>
      shipment.temperature < TEMPERATURE_MIN ||
      shipment.temperature > TEMPERATURE_MAX
  );
};

const getTopRiskyShipments = (shipments, count) => {
  return [...shipments]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, count);
};

const getAverageRiskScore = (shipments) => {
  if (shipments.length === 0) {
    return 0;
  }
  const total = shipments.reduce((sum, shipment) => sum + shipment.riskScore, 0);
  return total / shipments.length;
};

const getRiskBreakdown = (shipments) => {
  const breakdown = {
    low: 0,
    medium: 0,
    high: 0,
  };

  shipments.forEach((shipment) => {
    const level = classifyRisk(shipment.riskScore);
    breakdown[level]++;
  });

  return breakdown;
};

const getCommonDestinations = (shipments) => {
  const destinationCounts = {};

  shipments.forEach((shipment) => {
    destinationCounts[shipment.destination] =
      (destinationCounts[shipment.destination] || 0) + 1;
  });

  return Object.entries(destinationCounts)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count);
};

// ===== SAMPLE DATA GENERATOR =====
const generateSampleShipments = (count = 50) => {
  const destinations = [
    'NYC, USA',
    'London, UK',
    'Tokyo, Japan',
    'Toronto, Canada',
    'Berlin, Germany',
    'Sydney, Australia',
    'Dubai, UAE',
    'Singapore',
  ];

  const shipments = [];

  for (let i = 1; i <= count; i++) {
    const isExcursion = Math.random() < 0.3; // 30% have excursions
    const hasHighRisk = Math.random() < 0.2; // 20% have high risk

    // Generate temperature with some excursions
    let temperature;
    if (isExcursion && Math.random() < 0.5) {
      // Below 2°C
      temperature = Math.random() * 2 - 1;
    } else if (isExcursion) {
      // Above 8°C
      temperature = 8 + Math.random() * 5;
    } else {
      // Normal range 2-8°C
      temperature = 2 + Math.random() * 6;
    }

    // Generate humidity
    let humidity;
    if (hasHighRisk && Math.random() < 0.4) {
      // Out of range
      humidity = Math.random() < 0.5 ? Math.random() * 30 : 70 + Math.random() * 30;
    } else {
      // Normal range 30-70%
      humidity = 30 + Math.random() * 40;
    }

    // Create shipment
    const lastUpdated = new Date();
    lastUpdated.setDate(lastUpdated.getDate() - Math.random() * 14); // Random date within 14 days

    const shipment = {
      id: `PHM-${String(i).padStart(6, '0')}`,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      temperature: parseFloat(temperature.toFixed(2)),
      humidity: parseFloat(humidity.toFixed(2)),
      riskScore: 0, // Will be calculated
      hasTemperatureExcursion:
        temperature < TEMPERATURE_MIN || temperature > TEMPERATURE_MAX,
      lastUpdated,
    };

    // Calculate actual risk score
    shipment.riskScore = calculateRiskScore(shipment);

    shipments.push(shipment);
  }

  return shipments;
};

// ===== ANALYTICS CALCULATION =====
const generateAnalytics = (shipments) => {
  const highRiskShipments = identifyHighRisk(shipments);
  const temperatureExcursionShipments =
    identifyTemperatureExcursions(shipments);
  const riskBreakdown = getRiskBreakdown(shipments);
  const topFiveRiskyShipments = getTopRiskyShipments(shipments, 5);
  const commonDestinations = getCommonDestinations(shipments);
  const averageRiskScore = getAverageRiskScore(shipments);

  const totalShipments = shipments.length;

  return {
    totalShipments,
    highRiskCount: highRiskShipments.length,
    temperatureExcursionCount: temperatureExcursionShipments.length,
    riskDistribution: {
      low: {
        count: riskBreakdown.low,
        percentage: parseFloat(
          ((riskBreakdown.low / totalShipments) * 100).toFixed(2)
        ),
      },
      medium: {
        count: riskBreakdown.medium,
        percentage: parseFloat(
          ((riskBreakdown.medium / totalShipments) * 100).toFixed(2)
        ),
      },
      high: {
        count: riskBreakdown.high,
        percentage: parseFloat(
          ((riskBreakdown.high / totalShipments) * 100).toFixed(2)
        ),
      },
    },
    averageRiskScore: parseFloat(averageRiskScore.toFixed(2)),
    topFiveRiskyShipments: topFiveRiskyShipments.map((shipment, index) => ({
      ...shipment,
      riskLevel: classifyRisk(shipment.riskScore),
      temperatureStatus:
        shipment.temperature < TEMPERATURE_MIN
          ? `BELOW RANGE (${shipment.temperature}°C)`
          : shipment.temperature > TEMPERATURE_MAX
            ? `ABOVE RANGE (${shipment.temperature}°C)`
            : `IN RANGE (${shipment.temperature}°C)`,
    })),
    commonDestinations,
  };
};

// ===== MAIN EXECUTION =====
const main = () => {
  console.log(
    '═══════════════════════════════════════════════════════════════'
  );
  console.log('   PHARMA SHIPMENT RISK ANALYZER - ANALYTICS REPORT');
  console.log(
    '═══════════════════════════════════════════════════════════════\n'
  );

  // Generate sample data
  console.log('Generating 50 realistic pharma shipments...\n');
  const shipments = generateSampleShipments(50);

  // Calculate analytics
  const analytics = generateAnalytics(shipments);

  // Output results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalShipments: analytics.totalShipments,
      highRiskShipments: analytics.highRiskCount,
      temperatureExcursionShipments: analytics.temperatureExcursionCount,
      averageRiskScore: analytics.averageRiskScore,
    },
    riskDistribution: analytics.riskDistribution,
    topFiveRiskyShipments: analytics.topFiveRiskyShipments.map(
      (shipment, index) => ({
        rank: index + 1,
        id: shipment.id,
        destination: shipment.destination,
        riskScore: shipment.riskScore,
        riskLevel: shipment.riskLevel,
        temperature: shipment.temperature,
        temperatureStatus: shipment.temperatureStatus,
        humidity: shipment.humidity,
        lastUpdated: shipment.lastUpdated.toISOString(),
      })
    ),
    commonDestinations: analytics.commonDestinations,
  };

  console.log(JSON.stringify(results, null, 2));

  // Also save to file
  fs.writeFileSync(
    '/home/labuser/Downloads/claude-training-pwc/Day2_CaseStudy/analytics-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log(
    '\n✓ Analytics saved to: analytics-results.json'
  );
};

main();
