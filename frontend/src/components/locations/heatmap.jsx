import React from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';

// Przykładowe dane wejściowe
const rawData = [
  {
    saved_at: "2025-07-16T22:42:28.806001+02:00",
    value: "1.6890000000",
    sensor: { name: 'SENSOR-0002' }
  },
  // ... więcej pomiarów
];

// Funkcja transformująca dane do formatu Nivo Calendar
const prepareCalendarData = (measurements) => {
  const dataMap = new Map();

  // Przetwarzamy każdy pomiar
  measurements.forEach(measurement => {
    if (!measurement.saved_at || !measurement.value) return;

    const date = new Date(measurement.saved_at);
    const dateKey = date.toISOString().split('T')[0]; // Format "YYYY-MM-DD"
    const value = parseFloat(measurement.value);

    // Sumujemy wartości dla tego samego dnia
    if (dataMap.has(dateKey)) {
      dataMap.set(dateKey, dataMap.get(dateKey) + value);
    } else {
      dataMap.set(dateKey, value);
    }
  });

  // Konwertujemy do formatu wymaganego przez komponent
  return Array.from(dataMap.entries()).map(([day, value]) => ({
    day,
    value
  }));
};

const CalendarChart = ({measurements}) => {
  const calendarData = prepareCalendarData(measurements);

  // Określamy zakres dat (ostatnie 30 dni + dzisiaj + 1 dzień do przodu)
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 30);

  const toDate = new Date(today);
  toDate.setDate(toDate.getDate() + 1);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ResponsiveCalendar
        data={calendarData}
        from={fromDate.toISOString().split('T')[0]}
        to={toDate.toISOString().split('T')[0]}
        emptyColor="#eeeeee"
        colors={['#f47560', '#e8c1a0', '#97e3d5', '#61cdbb']}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        tooltip={({ day, value }) => (
          <div style={{
            padding: '12px',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            <strong>{day}</strong>
            <br />
            Wartość: {value ? value : 'Brak danych'}
          </div>
        )}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: 'right-to-left'
          }
        ]}
      />
    </div>
  );
};

export default CalendarChart;