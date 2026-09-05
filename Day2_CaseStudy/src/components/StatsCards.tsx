import React from 'react';
import { Package, AlertTriangle, Thermometer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shipment } from '../types/shipment';

interface StatsCardsProps {
  shipments: Shipment[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ shipments }) => {
  const totalShipments = shipments.length;
  const highRiskCount = shipments.filter(s => s.riskScore >= 7).length;
  const temperatureExcursionCount = shipments.filter(s => s.temperatureExcursion).length;

  const getRiskDistribution = () => {
    const low = shipments.filter(s => s.riskScore < 4).length;
    const medium = shipments.filter(s => s.riskScore >= 4 && s.riskScore < 7).length;
    const high = shipments.filter(s => s.riskScore >= 7).length;
    return [
      { name: 'Low', value: low, fill: '#10b981' },
      { name: 'Medium', value: medium, fill: '#f59e0b' },
      { name: 'High', value: high, fill: '#ef4444' },
    ];
  };

  const riskData = getRiskDistribution();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Shipments Card */}
      <div className="stat-card">
        <div className="flex items-center justify-between w-full mb-4">
          <h3 className="text-sm font-semibold text-slate-600">Total Shipments</h3>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package size={24} className="text-blue-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900">{totalShipments}</p>
        <p className="text-xs text-slate-500 mt-2">Active shipments in database</p>
      </div>

      {/* High Risk Shipments Card */}
      <div className="stat-card">
        <div className="flex items-center justify-between w-full mb-4">
          <h3 className="text-sm font-semibold text-slate-600">High-Risk Shipments</h3>
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-red-600">{highRiskCount}</p>
        <p className="text-xs text-slate-500 mt-2">
          {totalShipments > 0 ? `${((highRiskCount / totalShipments) * 100).toFixed(1)}% of total` : 'No data'}
        </p>
      </div>

      {/* Temperature Excursions Card */}
      <div className="stat-card">
        <div className="flex items-center justify-between w-full mb-4">
          <h3 className="text-sm font-semibold text-slate-600">Temperature Excursions</h3>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Thermometer size={24} className="text-orange-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-orange-600">{temperatureExcursionCount}</p>
        <p className="text-xs text-slate-500 mt-2">
          {totalShipments > 0 ? `${((temperatureExcursionCount / totalShipments) * 100).toFixed(1)}% of total` : 'No data'}
        </p>
      </div>

      {/* Risk Distribution Chart */}
      <div className="stat-card md:col-span-3">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => [`${value} shipments`, 'Count']}
            />
            <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
