import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Sample shipment data for testing
const sampleShipments = [
  {
    id: 'SHIP-00001',
    destination: 'New York',
    riskScore: 8.5,
    temperature: -15,
    temperatureExcursion: true,
    status: 'In Transit',
    carrier: 'FastFreight',
    departureDate: '2024-01-01',
    estimatedArrival: '2024-01-05',
    productType: 'Vaccine'
  },
  {
    id: 'SHIP-00002',
    destination: 'Los Angeles',
    riskScore: 4.2,
    temperature: -20,
    temperatureExcursion: false,
    status: 'Delivered',
    carrier: 'CoolTransit',
    departureDate: '2024-01-02',
    estimatedArrival: '2024-01-08',
    productType: 'Biologics'
  },
  {
    id: 'SHIP-00003',
    destination: 'Chicago',
    riskScore: 7.8,
    temperature: -18,
    temperatureExcursion: true,
    status: 'In Transit',
    carrier: 'PharmaShip',
    departureDate: '2024-01-03',
    estimatedArrival: '2024-01-06',
    productType: 'Vaccine'
  }
];

// Endpoints
app.get('/api/shipments', (req, res) => {
  res.json(sampleShipments);
});

app.get('/api/shipments/:id', (req, res) => {
  const shipment = sampleShipments.find(s => s.id === req.params.id);
  if (shipment) {
    res.json(shipment);
  } else {
    res.status(404).json({ error: 'Shipment not found' });
  }
});

app.post('/api/shipments', (req, res) => {
  const newShipment = {
    id: `SHIP-${String(sampleShipments.length + 1).padStart(5, '0')}`,
    ...req.body
  };
  sampleShipments.push(newShipment);
  res.status(201).json(newShipment);
});

app.get('/api/analytics', (req, res) => {
  const analytics = {
    totalShipments: sampleShipments.length,
    highRiskCount: sampleShipments.filter(s => s.riskScore >= 7).length,
    temperatureExcursionCount: sampleShipments.filter(s => s.temperatureExcursion).length,
    riskDistribution: {
      low: sampleShipments.filter(s => s.riskScore < 4).length,
      medium: sampleShipments.filter(s => s.riskScore >= 4 && s.riskScore < 7).length,
      high: sampleShipments.filter(s => s.riskScore >= 7).length,
    }
  };
  res.json(analytics);
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
