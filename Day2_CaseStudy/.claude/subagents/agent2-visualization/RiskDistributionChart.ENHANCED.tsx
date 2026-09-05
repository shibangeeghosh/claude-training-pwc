import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { Shipment } from '../types/shipment';
import { classifyRisk } from '../utils/riskCalculator';

interface RiskDistributionChartProps {
  shipments: Shipment[];
}

interface RiskData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  shipments,
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Memoized risk data calculation
  const riskData = useMemo<RiskData[]>(() => {
    if (shipments.length === 0) {
      return [
        { name: 'Low Risk', value: 0, percentage: 0, fill: '#10b981', riskLevel: 'low' },
        { name: 'Medium Risk', value: 0, percentage: 0, fill: '#f59e0b', riskLevel: 'medium' },
        { name: 'High Risk', value: 0, percentage: 0, fill: '#ef4444', riskLevel: 'high' },
      ];
    }

    // Use proper risk classification thresholds: Low ≤ 35, Medium 36-70, High > 70
    const lowRisk = shipments.filter(s => classifyRisk(s.riskScore) === 'low').length;
    const mediumRisk = shipments.filter(s => classifyRisk(s.riskScore) === 'medium').length;
    const highRisk = shipments.filter(s => classifyRisk(s.riskScore) === 'high').length;

    const total = shipments.length;

    return [
      {
        name: 'Low Risk',
        value: lowRisk,
        percentage: (lowRisk / total) * 100,
        fill: '#10b981',
        riskLevel: 'low',
      },
      {
        name: 'Medium Risk',
        value: mediumRisk,
        percentage: (mediumRisk / total) * 100,
        fill: '#f59e0b',
        riskLevel: 'medium',
      },
      {
        name: 'High Risk',
        value: highRisk,
        percentage: (highRisk / total) * 100,
        fill: '#ef4444',
        riskLevel: 'high',
      },
    ];
  }, [shipments]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (shipments.length === 0) {
      return {
        total: 0,
        avgRisk: 0,
        riskTrend: 'stable',
        healthScore: 100,
      };
    }

    const avgRisk =
      shipments.reduce((sum, s) => sum + s.riskScore, 0) / shipments.length;
    const healthScore = Math.max(0, 100 - avgRisk);
    const highRiskCount = riskData[2].value;
    const riskTrend =
      highRiskCount > shipments.length * 0.3 ? 'critical' : 'stable';

    return {
      total: shipments.length,
      avgRisk: avgRisk.toFixed(1),
      riskTrend,
      healthScore: healthScore.toFixed(1),
    };
  }, [shipments, riskData]);

  const totalShipments = shipments.length;

  // Custom pie chart label renderer
  const renderCustomLabel = ({
    name,
    value,
    percentage,
  }: {
    name: string;
    value: number;
    percentage: number;
  }) => {
    return `${name}: ${value} (${(percentage * 100).toFixed(1)}%)`;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Risk Distribution Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Shipments classified by risk level
            </p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {totalShipments === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-slate-50 rounded-lg">
          <Activity size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No shipment data available</p>
          <p className="text-sm text-slate-400 mt-2">
            Upload an Excel file to see risk distribution
          </p>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="mb-8">
            {chartType === 'pie' ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value} shipment${value !== 1 ? 's' : ''}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={riskData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `${value} shipment${value !== 1 ? 's' : ''}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Risk Breakdown Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {riskData.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  item.riskLevel === 'low'
                    ? 'bg-green-50 border-green-500'
                    : item.riskLevel === 'medium'
                    ? 'bg-amber-50 border-amber-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-2xl font-bold" style={{ color: item.fill }}>
                  {item.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.value} of {totalShipments} shipments
                </p>
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                  Average Risk Score
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.avgRisk}
                </p>
                <p className="text-xs text-slate-500 mt-1">out of 100</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                  Fleet Health Score
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.healthScore}%
                </p>
                <p
                  className={`text-xs mt-1 font-medium ${
                    stats.riskTrend === 'critical'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {stats.riskTrend === 'critical'
                    ? '⚠️ Critical trend'
                    : '✓ Stable'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
