import React from 'react';
import { Lightbulb, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Shipment, Recommendation } from '../types/shipment';

interface AIRecommendationsProps {
  shipments: Shipment[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ shipments }) => {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    const highRiskCount = shipments.filter(s => s.riskScore >= 7).length;
    const temperatureExcursionCount = shipments.filter(s => s.temperatureExcursion).length;
    const avgRiskScore = shipments.length > 0 ? shipments.reduce((sum, s) => sum + s.riskScore, 0) / shipments.length : 0;

    // Recommendation 1: High-Risk Management
    if (highRiskCount > 0) {
      const percentage = ((highRiskCount / shipments.length) * 100).toFixed(1);
      recommendations.push({
        id: '1',
        title: 'Enhanced Monitoring for High-Risk Shipments',
        description: `${highRiskCount} shipments (${percentage}%) are classified as high-risk. Implement real-time GPS tracking and temperature monitoring for these shipments.`,
        priority: 'high',
        actionItems: [
          'Set up automated alerts for shipments with risk scores above 7',
          'Assign dedicated courier for high-risk shipments',
          'Implement hourly temperature monitoring instead of standard intervals',
        ],
      });
    }

    // Recommendation 2: Temperature Control
    if (temperatureExcursionCount > 0) {
      recommendations.push({
        id: '2',
        title: 'Temperature Excursion Prevention',
        description: `${temperatureExcursionCount} shipments have experienced temperature excursions. Review and upgrade cold chain infrastructure.`,
        priority: 'high',
        actionItems: [
          'Audit all refrigeration units and upgrade if necessary',
          'Implement redundant cooling systems for high-value shipments',
          'Train personnel on proper temperature maintenance procedures',
        ],
      });
    }

    // Recommendation 3: General Risk Mitigation
    if (avgRiskScore > 5) {
      recommendations.push({
        id: '3',
        title: 'Overall Risk Mitigation Strategy',
        description: `Average risk score is ${avgRiskScore.toFixed(1)}/10. Implement comprehensive risk mitigation measures across operations.`,
        priority: 'medium',
        actionItems: [
          'Review and update standard operating procedures for shipments',
          'Increase quality checks and validation touchpoints',
          'Implement predictive analytics for early risk detection',
        ],
      });
    } else if (recommendations.length === 0) {
      recommendations.push({
        id: '4',
        title: 'Maintain Current Operations',
        description: 'Shipment data shows low overall risk. Continue monitoring and maintain current quality standards.',
        priority: 'low',
        actionItems: [
          'Continue regular monitoring and audits',
          'Maintain current cold chain procedures',
          'Document best practices for future reference',
        ],
      });
    }

    return recommendations.slice(0, 4);
  };

  const recommendations = generateRecommendations();

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

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb size={24} className="text-yellow-600" />
        <h3 className="text-xl font-bold text-slate-900">AI-Generated Recommendations</h3>
      </div>

      {shipments.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Upload shipment data to see recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border-l-4 ${
                rec.priority === 'high'
                  ? 'border-red-500 bg-red-50'
                  : rec.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-green-500 bg-green-50'
              } p-4 rounded-lg`}
            >
              <div className="flex items-start gap-3 mb-3">
                {getPriorityIcon(rec.priority)}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                  <span className={`inline-block mt-1 ${getPriorityBadge(rec.priority)}`}>
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-3">{rec.description}</p>

              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Action Items:</p>
                <ul className="space-y-2">
                  {rec.actionItems.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
