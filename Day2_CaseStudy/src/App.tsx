import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { StatsCards } from './components/StatsCards';
import { RiskDistributionChart } from './components/RiskDistributionChart';
import { TopRiskyShipments } from './components/TopRiskyShipments';
import { AIRecommendations } from './components/AIRecommendations';
import { Shipment } from './types/shipment';

function App() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const handleDataLoaded = (newShipments: Shipment[]) => {
    setShipments(newShipments);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Pharma Shipment Risk Analyzer</h1>
              <p className="text-sm text-slate-500 mt-1">Real-time monitoring and risk assessment for pharmaceutical shipments</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* File Upload Section */}
        <div className="mb-12">
          <FileUpload onDataLoaded={handleDataLoaded} />
        </div>

        {/* Dashboard Sections */}
        {shipments.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="mb-12">
              <StatsCards shipments={shipments} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Risk Distribution Chart */}
              <div>
                <RiskDistributionChart shipments={shipments} />
              </div>

              {/* AI Recommendations */}
              <div>
                <AIRecommendations shipments={shipments} />
              </div>
            </div>

            {/* Top Risky Shipments */}
            <div className="mb-12">
              <TopRiskyShipments shipments={shipments} />
            </div>

            {/* Footer Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-sm text-blue-900">
                Analyzed {shipments.length} shipment(s) • Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </>
        )}

        {/* Empty State */}
        {shipments.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <BarChart3 size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Analyze</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Upload an Excel file (.xlsx) with your shipment data to get started. The system will analyze risk factors, temperature excursions, and provide actionable recommendations.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Features</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>Real-time risk assessment</li>
                <li>Temperature monitoring</li>
                <li>AI-powered recommendations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Data Format</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>Excel (.xlsx) files</li>
                <li>Flexible column mapping</li>
                <li>Real-time parsing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Support</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>Documentation</li>
                <li>Sample templates</li>
                <li>Contact support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            <p>&copy; 2024 Pharma Shipment Risk Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
