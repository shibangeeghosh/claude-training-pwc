import React, { useMemo } from 'react';
import {
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  Thermometer,
  Package,
  Clock,
  Zap,
} from 'lucide-react';
import { Shipment, Recommendation } from '../types/shipment';
import { classifyRisk, identifyTemperatureExcursions } from '../utils/riskCalculator';

interface AIRecommendationsProps {
  shipments: Shipment[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  shipments,
}) => {
  const recommendations = useMemo<Recommendation[]>(() => {
    const recommendations: Recommendation[] = [];

    if (shipments.length === 0) {
      return recommendations;
    }

    // Analysis metrics
    const highRiskShipments = shipments.filter(
      s => classifyRisk(s.riskScore) === 'high'
    );
    const mediumRiskShipments = shipments.filter(
      s => classifyRisk(s.riskScore) === 'medium'
    );
    const temperatureExcursions = identifyTemperatureExcursions(shipments);
    const avgRiskScore =
      shipments.reduce((sum, s) => sum + s.riskScore, 0) / shipments.length;

    // Identify aging shipments (>7 days)
    const now = new Date();
    const agingShipments = shipments.filter(s => {
      const daysOld =
        (now.getTime() - s.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      return daysOld > 7;
    });

    // Identify humidity excursions
    const humidityExcursions = shipments.filter(
      s => s.humidity < 30 || s.humidity > 70
    );

    // Identify frequent destinations for consolidation
    const destinationMap: Record<string, Shipment[]> = {};
    shipments.forEach(s => {
      if (!destinationMap[s.destination]) {
        destinationMap[s.destination] = [];
      }
      destinationMap[s.destination].push(s);
    });
    const frequentDestinations = Object.entries(destinationMap)
      .filter(([_, shipments]) => shipments.length >= 3)
      .sort((a, b) => b[1].length - a[1].length);

    // ===== RECOMMENDATION 1: Temperature Excursion Prevention =====
    if (temperatureExcursions.length > 0) {
      const percentage = (
        (temperatureExcursions.length / shipments.length) *
        100
      ).toFixed(1);
      const avgDeviation =
        temperatureExcursions.reduce((sum, s) => {
          const deviation =
            s.temperature < 2 ? 2 - s.temperature : s.temperature - 8;
          return sum + deviation;
        }, 0) / temperatureExcursions.length;

      recommendations.push({
        id: '1',
        title: 'Implement Temperature Excursion Prevention Protocol',
        description: `${temperatureExcursions.length} shipments (${percentage}%) have experienced temperature deviations averaging ${avgDeviation.toFixed(1)}°C from target range (2-8°C). This represents a critical compliance risk.`,
        priority: 'high',
        actionItems: [
          'Conduct immediate audit of all refrigeration units and thermal monitoring equipment',
          'Implement real-time temperature alerts at ±0.5°C deviation thresholds',
          'Require redundant temperature sensors on all cold-chain shipments',
          'Deploy passive thermal packaging with enhanced phase-change materials',
          'Establish backup cooling protocols for equipment failures',
        ],
      });
    }

    // ===== RECOMMENDATION 2: High-Risk Shipment Management =====
    if (highRiskShipments.length > 0) {
      const percentage = (
        (highRiskShipments.length / shipments.length) *
        100
      ).toFixed(1);
      const avgHighRiskScore =
        highRiskShipments.reduce((sum, s) => sum + s.riskScore, 0) /
        highRiskShipments.length;

      recommendations.push({
        id: '2',
        title: 'Enhanced Risk Mitigation for High-Risk Shipments',
        description: `${highRiskShipments.length} shipments (${percentage}%) classified as high-risk with average score of ${avgHighRiskScore.toFixed(1)}/100. Implement enhanced monitoring and control measures immediately.`,
        priority: 'high',
        actionItems: [
          'Assign dedicated cold-chain specialists to all high-risk shipments',
          'Implement hourly (instead of 4-hourly) temperature and humidity monitoring',
          'Establish geofencing alerts for route deviations or stops exceeding 30 minutes',
          'Require cold-chain integrity documentation at each transfer point',
          'Prioritize these shipments for expedited delivery to minimize transit time',
        ],
      });
    }

    // ===== RECOMMENDATION 3: Humidity Control Optimization =====
    if (humidityExcursions.length > 0) {
      const percentage = (
        (humidityExcursions.length / shipments.length) *
        100
      ).toFixed(1);
      recommendations.push({
        id: '3',
        title: 'Humidity Management and Environmental Control',
        description: `${humidityExcursions.length} shipments (${percentage}%) show humidity levels outside the 30-70% optimal range, risking product degradation and stability compromise.`,
        priority: 'high',
        actionItems: [
          'Install humidity-control units (desiccant or silica-based) in all shipping containers',
          'Implement humidity buffers and sealed packaging for moisture-sensitive products',
          'Validate humidity sensor calibration monthly as per FDA guidelines',
          'Establish maximum humidity thresholds with automatic container rejection protocols',
          'Use moisture-barrier films and oxygen absorbers for light-sensitive pharmaceuticals',
        ],
      });
    }

    // ===== RECOMMENDATION 4: Aging Shipment Management =====
    if (agingShipments.length > 0) {
      const percentage = (
        (agingShipments.length / shipments.length) *
        100
      ).toFixed(1);
      const oldestDaysOld = Math.max(
        ...agingShipments.map(
          s => (now.getTime() - s.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      recommendations.push({
        id: '4',
        title: 'Expedite Resolution of In-Transit Shipments',
        description: `${agingShipments.length} shipments (${percentage}%) have been in transit for >7 days, with the oldest at ${oldestDaysOld.toFixed(0)} days. Extended transit times increase degradation risk.`,
        priority: 'medium',
        actionItems: [
          'Investigate root causes of delays (routing, weather, logistics constraints)',
          'Implement predictive delivery analytics to anticipate delays',
          'Establish maximum allowed transit times per destination route',
          'For shipments exceeding thresholds, consider expedited re-shipment of replacement',
          'Prioritize local warehousing strategies to reduce long-distance shipments',
        ],
      });
    }

    // ===== RECOMMENDATION 5: Consolidation & Route Optimization =====
    if (frequentDestinations.length > 0) {
      const topDestination = frequentDestinations[0];
      recommendations.push({
        id: '5',
        title: 'Supply Chain Consolidation and Route Optimization',
        description: `High-frequency shipments to key destinations (${topDestination[0]} receives ${topDestination[1].length} shipments) present consolidation opportunities for cost and quality improvement.`,
        priority: 'medium',
        actionItems: [
          `Establish regional distribution hubs near frequent destinations (${topDestination[0]}, ${frequentDestinations[1]?.[0] || 'secondary markets'})`,
          'Implement batch consolidation for shipments to same destination within 48-hour window',
          'Negotiate dedicated cold-chain routes with preferred logistics partners',
          'Reduce per-unit transit time through consolidation, improving product stability',
          'Develop demand forecasting to align shipment frequency with consolidation windows',
        ],
      });
    }

    // ===== RECOMMENDATION 6: Overall Fleet Health Assessment =====
    if (avgRiskScore > 50 || recommendations.length < 2) {
      const healthStatus =
        avgRiskScore <= 35
          ? 'Excellent'
          : avgRiskScore <= 70
          ? 'Good'
          : 'Poor';

      if (avgRiskScore > 50) {
        recommendations.push({
          id: '6',
          title: 'Comprehensive Cold-Chain Infrastructure Review',
          description: `Fleet average risk score is ${avgRiskScore.toFixed(1)}/100 (${healthStatus} health). Conduct comprehensive infrastructure assessment to identify systemic issues.`,
          priority: avgRiskScore > 70 ? 'high' : 'medium',
          actionItems: [
            'Perform full audit of cold-chain equipment and infrastructure compliance',
            'Validate all monitoring equipment (thermometers, data loggers) against calibration standards',
            'Review and update SOPs for temperature maintenance, packaging, and handling',
            'Train all personnel on best practices and compliance requirements',
            'Implement quarterly audits and certifications for carriers and logistics partners',
          ],
        });
      } else if (recommendations.length < 2) {
        recommendations.push({
          id: '7',
          title: 'Maintain and Document Best Practices',
          description: `Your fleet demonstrates strong cold-chain performance (avg risk score: ${avgRiskScore.toFixed(1)}/100). Continue current excellence and document processes.`,
          priority: 'low',
          actionItems: [
            'Document current best practices and standard operating procedures',
            'Establish quarterly performance review and continuous improvement cycles',
            'Share success metrics and processes with logistics partners',
            'Implement preventive maintenance schedules for all equipment',
            'Maintain rigorous compliance documentation and audit trails',
          ],
        });
      }
    }

    return recommendations.slice(0, 6);
  }, [shipments]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'medium':
        return <Info size={20} className="text-yellow-600" />;
      default:
        return <CheckCircle size={20} className="text-green-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      default:
        return 'badge-low';
    }
  };

  const getRecommendationIcon = (id: string) => {
    switch (id) {
      case '1':
        return <Thermometer size={18} />;
      case '2':
        return <Zap size={18} />;
      case '3':
        return <Package size={18} />;
      case '4':
        return <Clock size={18} />;
      default:
        return <Lightbulb size={18} />;
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Lightbulb size={24} className="text-yellow-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            AI-Generated Recommendations
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pharma industry best practices analysis
          </p>
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg">
          <Lightbulb size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            Upload shipment data to receive recommendations
          </p>
          <p className="text-sm text-slate-400 mt-2">
            We'll analyze your cold-chain operations and provide actionable insights
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle size={48} className="text-green-600 mb-4" />
          <p className="text-green-900 font-medium">
            Excellent Cold-Chain Performance
          </p>
          <p className="text-sm text-green-700 mt-2">
            No immediate recommendations. Continue current operations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className={`border-l-4 rounded-lg transition-all hover:shadow-md ${
                rec.priority === 'high'
                  ? 'border-red-500 bg-red-50'
                  : rec.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-green-500 bg-green-50'
              } p-4`}
            >
              {/* Header Row */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    rec.priority === 'high'
                      ? 'bg-red-100 text-red-600'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {getRecommendationIcon(rec.id)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 leading-snug">
                        {rec.title}
                      </h4>
                      <span
                        className={`inline-block mt-2 ${getPriorityBadge(
                          rec.priority
                        )}`}
                      >
                        {getPriorityIcon(rec.priority)}
                        <span className="ml-1.5">
                          {rec.priority.charAt(0).toUpperCase() +
                            rec.priority.slice(1)}{' '}
                          Priority
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-700 mb-3 ml-11">
                {rec.description}
              </p>

              {/* Action Items */}
              <div className="bg-white rounded-lg p-3 ml-11 border border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                  Recommended Actions
                </p>
                <ul className="space-y-2">
                  {rec.actionItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-700 flex items-start gap-2"
                    >
                      <span className="flex-shrink-0 mt-1">
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${
                            rec.priority === 'high'
                              ? 'bg-red-200 text-red-700'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-200 text-yellow-700'
                              : 'bg-green-200 text-green-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      {shipments.length > 0 && recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">Note:</span> Recommendations are based
            on pharma industry best practices (FDA, ICH guidelines) and your current
            shipment data. Prioritize high-priority items for immediate action.
          </p>
        </div>
      )}
    </div>
  );
};
