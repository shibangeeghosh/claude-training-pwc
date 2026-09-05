import React, { useState } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Shipment } from '../types/shipment';

interface RiskDistributionChartProps {
  shipments: Shipment[];
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ shipments }) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const getRiskData = () => {
    const low = shipments.filter(s => s.riskScore < 4).length;
    const medium = shipments.filter(s => s.riskScore >= 4 && s.riskScore < 7).length;
    const high = shipments.filter(s => s.riskScore >= 7).length;

    return [
      { name: 'Low Risk', value: low, fill: '#10b981' },
      { name: 'Medium Risk', value: medium, fill: '#f59e0b' },
      { name: 'High Risk', value: high, fill: '#ef4444' },
    ];
  };

  const data = getRiskData();
  const totalShipments = shipments.length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Risk Distribution Analysis</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {totalShipments === 0 ? (
        <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No shipment data available</p>
        </div>
      ) : (
        <>
          {chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => (
                    `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  )}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} shipments`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => `${value} shipments`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.fill }}
                ></div>
                <span className="text-sm font-medium text-slate-700">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
