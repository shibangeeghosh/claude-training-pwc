# Sample Data Template

This document provides sample shipment data that you can use to test the Pharma Shipment Risk Analyzer.

## How to Create Sample Excel File

You can create an Excel file (.xlsx) with the following sample data. The easiest way is to:

1. Open Microsoft Excel or Google Sheets
2. Create columns with these headers: ID, Destination, Risk Score, Temperature, Status, Temperature Excursion, Carrier, Departure Date, Estimated Arrival, Product Type
3. Add the sample rows below
4. Save as Excel format (.xlsx)
5. Upload to the analyzer

## Sample Shipment Data

### Row 1:
- ID: SHIP-00001
- Destination: New York
- Risk Score: 8.5
- Temperature: -15
- Status: In Transit
- Temperature Excursion: Yes
- Carrier: FastFreight
- Departure Date: 2024-01-01
- Estimated Arrival: 2024-01-05
- Product Type: Vaccine

### Row 2:
- ID: SHIP-00002
- Destination: Los Angeles
- Risk Score: 4.2
- Temperature: -20
- Status: Delivered
- Temperature Excursion: No
- Carrier: CoolTransit
- Departure Date: 2024-01-02
- Estimated Arrival: 2024-01-08
- Product Type: Biologics

### Row 3:
- ID: SHIP-00003
- Destination: Chicago
- Risk Score: 7.8
- Temperature: -18
- Status: In Transit
- Temperature Excursion: Yes
- Carrier: PharmaShip
- Departure Date: 2024-01-03
- Estimated Arrival: 2024-01-06
- Product Type: Vaccine

### Row 4:
- ID: SHIP-00004
- Destination: Miami
- Risk Score: 3.1
- Temperature: -22
- Status: In Transit
- Temperature Excursion: No
- Carrier: CoolTransit
- Departure Date: 2024-01-04
- Estimated Arrival: 2024-01-07
- Product Type: Antibiotics

### Row 5:
- ID: SHIP-00005
- Destination: Seattle
- Risk Score: 9.2
- Temperature: -12
- Status: In Transit
- Temperature Excursion: Yes
- Carrier: PharmaShip
- Departure Date: 2024-01-05
- Estimated Arrival: 2024-01-10
- Product Type: Biologics

### Row 6:
- ID: SHIP-00006
- Destination: Boston
- Risk Score: 5.5
- Temperature: -19
- Status: In Transit
- Temperature Excursion: No
- Carrier: FastFreight
- Departure Date: 2024-01-06
- Estimated Arrival: 2024-01-09
- Product Type: Vaccine

### Row 7:
- ID: SHIP-00007
- Destination: Denver
- Risk Score: 2.8
- Temperature: -21
- Status: Delivered
- Temperature Excursion: No
- Carrier: CoolTransit
- Departure Date: 2024-01-07
- Estimated Arrival: 2024-01-11
- Product Type: Antibiotics

### Row 8:
- ID: SHIP-00008
- Destination: Houston
- Risk Score: 6.9
- Temperature: -16
- Status: In Transit
- Temperature Excursion: Yes
- Carrier: PharmaShip
- Departure Date: 2024-01-08
- Estimated Arrival: 2024-01-12
- Product Type: Vaccine

## Risk Score Breakdown

- **Low Risk (0-3.9)**: Green badges, well-maintained conditions
- **Medium Risk (4-6.9)**: Yellow badges, some concerns but manageable
- **High Risk (7-10)**: Red badges, requires immediate attention

## Temperature Guidelines

- Optimal temperature for pharmaceutical shipments: -18°C to -25°C
- Any deviation from this range may trigger excursion alert
- The system flags any shipment marked with "Yes" in Temperature Excursion column

## Status Types

- **In Transit**: Shipment is currently being transported
- **Delivered**: Shipment has reached destination
- **Delayed**: Shipment is behind schedule
- **Pending**: Shipment awaiting dispatch

## Product Types

Common pharmaceutical product types:
- Vaccine
- Biologics
- Antibiotics
- Medications
- Reagents

## Creating Your Own File

To create your own sample file:

1. Open Excel/Google Sheets
2. Add headers as shown above (or use minimal: ID, Destination, Risk Score, Temperature, Status)
3. Add your shipment data rows
4. Save as .xlsx file
5. Upload via drag-and-drop in the analyzer

The system will automatically parse and analyze your data!

## Format Notes

- Risk Score: Use decimal numbers (0-10)
- Temperature: Use negative numbers for freezer temps (-22, -15, etc.)
- Temperature Excursion: Use "Yes", "No", "True", "False", or leave blank for No
- Dates: Any standard date format (YYYY-MM-DD, MM/DD/YYYY, etc.)

