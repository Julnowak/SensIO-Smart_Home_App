import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnergyCharts = ({ measurements }) => {
  const energyMeasurements = measurements?.filter(
    m => m.sensor?.data_type === "ENERGY"
  );

  // Prepare color palette for consistent coloring
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57'];

  const preparePieData = () => {
    const locationMap = {};

    energyMeasurements?.forEach(m => {
      const locationName = m.sensor?.device?.location?.name || 'Brak lokalizacji';
      if (!locationMap[locationName]) {
        locationMap[locationName] = 0;
      }
      locationMap[locationName] += parseFloat(m.value);
    });

    return Object.entries(locationMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  console.log(energyMeasurements)

  const exampleMeasurements = [
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Klimatyzacja",
        location: { name: "Budynek A" }
      }
    },
    value: "15.5",
    created_at: "2023-06-05T08:00:00" // poniedziałek
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Oświetlenie",
        location: { name: "Budynek A" }
      }
    },
    value: "8.2",
    created_at: "2023-06-05T18:00:00" // poniedziałek
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Komputery",
        location: { name: "Budynek B" }
      }
    },
    value: "12.1",
    created_at: "2023-06-06T09:00:00" // wtorek
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Serwerownia",
        location: { name: "Budynek A" }
      }
    },
    value: "24.3",
    created_at: "2023-06-06T12:00:00" // wtorek
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Klimatyzacja",
        location: { name: "Budynek A" }
      }
    },
    value: "18.2",
    created_at: "2023-06-07T10:00:00" // środa
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Oświetlenie",
        location: { name: "Budynek C" }
      }
    },
    value: "5.7",
    created_at: "2023-06-08T08:00:00" // czwartek
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Komputery",
        location: { name: "Budynek B" }
      }
    },
    value: "9.8",
    created_at: "2023-06-09T14:00:00" // piątek
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Oświetlenie",
        location: { name: "Budynek A" }
      }
    },
    value: "3.2",
    created_at: "2023-06-10T20:00:00" // sobota
  },
  {
    sensor: {
      data_type: "ENERGY",
      device: {
        name: "Klimatyzacja",
        location: { name: "Budynek C" }
      }
    },
    value: "7.5",
    created_at: "2023-06-11T12:00:00" // niedziela
  }
];

  const prepareBarData = () => {
  const dayLocationMap = {};
  const locationColors = {};
  const daysOrder = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

  const allLocations = new Set();

  energyMeasurements?.forEach(m => {
    const locationName = m.sensor?.device?.location?.name || 'Brak lokalizacji';
    allLocations.add(locationName);
  });

  daysOrder.forEach(day => {
    dayLocationMap[day] = {};
    allLocations.forEach(location => {
      dayLocationMap[day][location] = 0;
    });
  });

  Array.from(allLocations).forEach((location, index) => {
    locationColors[location] = COLORS[index % COLORS.length];
  });

  energyMeasurements?.forEach(m => {
    const date = new Date(m.created_at);
    const dayOfWeek = date.toLocaleString('pl-PL', { weekday: 'long' });
    const locationName = m.sensor?.device?.location?.name || 'Brak lokalizacji';
    const value = parseFloat(m.value);

    dayLocationMap[dayOfWeek][locationName] += value;
  });

  // Przygotuj dane w formacie odpowiednim dla wykresu
  const data = daysOrder.map(day => {
    const entry = { day };
    Object.entries(dayLocationMap[day]).forEach(([location, value]) => {
      entry[location] = parseFloat(value.toFixed(2));
    });
    return entry;
  });

  return { data, locationColors };
};

  const pieData = preparePieData();
  const { data: barData, locationColors } = prepareBarData();
  const locations = Object.keys(locationColors || {});

  return (
    <Grid container sx={{ mb:4}} ga>
      <Grid size={{xs:12, md:6}}>
        <Paper elevation={3} sx={{ p: 2, height: '100%', mr:1 , mt:1, mb:2}}>
          <Typography variant="h6" align="center" gutterBottom>
            Zużycie energii według lokalizacji
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} kWh`, 'Zużycie']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid size={{xs:12, md:6}}>
        <Paper elevation={3} sx={{ p: 2, height: '100%', ml:1 , mt:1, mb:2 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Zużycie energii wg dni tygodnia
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={barData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                label={{
                  value: 'Zużycie energii (kWh)',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip
                formatter={(value) => [`${value} kWh`, 'Zużycie']}
              />
              <Legend />
              {locations.map((location, index) => (
                <Bar
                  key={location}
                  dataKey={location}
                  stackId="a"
                  fill={locationColors[location]}
                  name={location}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EnergyCharts;