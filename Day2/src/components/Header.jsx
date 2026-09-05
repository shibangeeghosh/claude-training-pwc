import React from 'react'
import { Shield, CheckCircle } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-eli-navy to-eli-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ALCOA+ Compliance</h1>
              <p className="text-eli-light text-sm">Quality Assurance Management System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-eli-light">Eli Lilly Quality Department</p>
            <p className="text-sm opacity-75">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
