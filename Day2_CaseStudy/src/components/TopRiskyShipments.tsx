import React from 'react';
import { AlertTriangle, Thermometer, TrendingUp } from 'lucide-react';
import { Shipment } from '../types/shipment';

interface TopRiskyShipmentsProps {
  shipments: Shipment[];
}

export const TopRiskyShipments: React.FC<TopRiskyShipmentsProps> = ({ shipments }) => {
  const topRiskyShipments = shipments
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const getRiskBadgeClass = (riskScore: number) => {
    if (riskScore >= 7) return 'badge-high';
    if (riskScore >= 4) return 'badge-medium';
    return 'badge-low';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 7) return 'High Risk';
    if (riskScore >= 4) return 'Medium Risk';
    return 'Low Risk';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-blue-600" />
        <h3 className="text-xl font-bold text-slate-900">Top 5 Highest-Risk Shipments</h3>
      </div>

      {topRiskyShipments.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No shipment data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Shipment ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Destination</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Risk Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Temperature</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topRiskyShipments.map((shipment, index) => (
                <tr
                  key={shipment.id}
                  className={`hover:bg-slate-50 transition-colors duration-200 ${
                    shipment.temperatureExcursion ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{shipment.id}</span>
                      {shipment.temperatureExcursion && (
                        <Thermometer size={16} className="text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-700">{shipment.destination}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`${getRiskBadgeClass(shipment.riskScore)}`}>
                        {shipment.riskScore.toFixed(1)} - {getRiskLabel(shipment.riskScore)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-900">{shipment.temperature}°C</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topRiskyShipments.some(s => s.temperatureExcursion) && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Temperature Excursions Detected</p>
            <p className="text-sm text-red-800 mt-1">
              {topRiskyShipments.filter(s => s.temperatureExcursion).length} shipment(s) in this list have experienced temperature excursions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
