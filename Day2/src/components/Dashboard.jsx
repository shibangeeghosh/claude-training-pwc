import React from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import StatCard from './StatCard'

const complianceData = [
  { principle: 'Attributable', compliance: 95 },
  { principle: 'Legible', compliance: 92 },
  { principle: 'Contemporaneous', compliance: 88 },
  { principle: 'Original', compliance: 97 },
  { principle: 'Accurate', compliance: 90 },
  { principle: 'Complete', compliance: 85 },
  { principle: 'Consistent', compliance: 93 },
  { principle: 'Enduring', compliance: 87 }
]

const trendData = [
  { month: 'Jul', score: 82 },
  { month: 'Aug', score: 85 },
  { month: 'Sep', score: 87 },
  { month: 'Oct', score: 90 },
  { month: 'Nov', score: 92 },
  { month: 'Dec', score: 88 }
]

const categoryData = [
  { name: 'Compliant', value: 156, color: '#10b981' },
  { name: 'Warning', value: 24, color: '#f59e0b' },
  { name: 'Non-Compliant', value: 8, color: '#ef4444' }
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Compliance"
          value="91%"
          icon={CheckCircle2}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Audits Passed"
          value="156"
          icon={TrendingUp}
          color="text-eli-blue"
          bgColor="bg-eli-light"
        />
        <StatCard
          title="Active Warnings"
          value="24"
          icon={AlertCircle}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Avg Response Time"
          value="2.4h"
          icon={Clock}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ALCOA+ Principles Compliance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="principle" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="compliance" fill="#0066CC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[75, 95]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0066CC" strokeWidth={2} dot={{ fill: '#0066CC' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {[
              { action: 'Data integrity audit completed', status: 'success', time: '2 hours ago' },
              { action: 'Non-conformance report filed', status: 'warning', time: '4 hours ago' },
              { action: 'Compliance training updated', status: 'success', time: '1 day ago' },
              { action: 'System backup verified', status: 'success', time: '2 days ago' },
              { action: 'Documentation review flagged', status: 'warning', time: '3 days ago' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                <div className={`w-3 h-3 rounded-full ${item.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
