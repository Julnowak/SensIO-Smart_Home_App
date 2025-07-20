import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';



// Funkcja transformująca dane do formatu Nivo Heatmap
const prepareHeatmapData = (measurements) => {
  const daysMap = new Map();
  const now = new Date();


  const dateRange = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dateRange.push(date.toISOString().split('T')[0]);
  }

  // Dodajemy dzień do przodu
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateRange.push(tomorrow.toISOString().split('T')[0]);

  // Inicjalizacja struktury danych
  dateRange.forEach(day => {
    daysMap.set(day, {
      id: day,
      data: Array.from({ length: 24 }, (_, i) => ({
        x: `${String(i).padStart(2, '0')}:00`,
        y: 0
      }))
    });
  });

  // Wypełniamy danymi
  measurements.forEach(measurement => {
    if (!measurement.saved_at || !measurement.value) return;

    const date = new Date(measurement.saved_at);
    const dayKey = date.toISOString().split('T')[0];
    const hour = date.getHours();
    const value = parseFloat(measurement.value);

    if (daysMap.has(dayKey)) {
      const dayData = daysMap.get(dayKey);
      dayData.data[hour].y += value;
    }
  });

  return Array.from(daysMap.values());
};

const EnergyDashboard = ({measurements}) => {
  const heatmapData = prepareHeatmapData(measurements);

  return (
    <div style={{ height: '800px', width: '100%' }}>
      <ResponsiveHeatMap
        data={heatmapData}
        margin={{ top: 100, right: 60, bottom: 60, left: 60 }}
        valueFormat=" >-.2f"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: '',
          legendOffset: 46
        }}
        axisRight={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Godzina',
          legendPosition: 'middle',
          legendOffset: 70
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Dzień',
          legendPosition: 'middle',
          legendOffset: -72
        }}
        colors={{
          type: 'sequential',
          scheme: 'reds',
          minValue: 0,
          maxValue: Math.max(...heatmapData.flatMap(d => d.data.map(item => item.y)) || 10)
        }}
        emptyColor="#555555"
        borderRadius={2}
        borderWidth={1}
        borderColor="#000000"
        enableGridX={true}
        enableGridY={true}
        tooltip={({ cell }) => (
          <div style={{
            padding: '8px',
            background: '#ffffff',
            border: '1px solid #cccccc'
          }}>
            <strong>{cell.serieId}</strong>
            <br />
            Godzina: {cell.data.x}
            <br />
            Wartość: {cell.data.y.toFixed(2)}
          </div>
        )}
      />
    </div>
  );
};

export default EnergyDashboard;