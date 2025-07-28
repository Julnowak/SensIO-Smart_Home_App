import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Chip
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    ReferenceLine
} from 'recharts';

// Kolory dla wykresów
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const generateEnergyData = () => {
    const data = [];
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, '0');
    const formatDateTime = (date) => {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`;
    };

    // Dane rzeczywiste – dziś (24 godziny)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
        const hour = new Date(today);
        hour.setHours(i);

        const isDayTime = i >= 7 && i <= 23;
        const baseUsage = isDayTime ? 1.8 : 0.9;
        const randomFactor = Math.random() * 0.6 - 0.3;
        const hourPattern = Math.sin((i - 7) * Math.PI / 16) * 0.7;

        data.push({
            time: formatDateTime(hour),
            usage: parseFloat((baseUsage + randomFactor + hourPattern).toFixed(2)),
            prediction: null,
        });
    }

    // Predykcja – jutro (24 godziny)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
        const hour = new Date(tomorrow);
        hour.setHours(i);

        const isDayTime = i >= 7 && i <= 23;
        const baseUsage = isDayTime ? 1.7 : 0.85;
        const randomFactor = Math.random() * 0.8 - 0.4;
        const hourPattern = Math.sin((i - 7) * Math.PI / 16) * 0.65;

        data.push({
            time: formatDateTime(hour),
            usage: null,
            prediction: parseFloat((baseUsage + randomFactor + hourPattern).toFixed(2)),
        });
    }

    // Posortuj dane według czasu
    data.sort((a, b) => new Date(a.time) - new Date(b.time));

    return data;
};


const generateTemperatureData = () => {
    const data = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - 24 + i);

        const isDayTime = hour.getHours() >= 8 && hour.getHours() <= 20;
        const baseTemp = isDayTime ? 22 : 18;
        const randomFactor = (Math.random() * 3) - 1.5;

        data.push({
            time: `${hour.getHours()}:00`,
            temperature: (baseTemp + randomFactor).toFixed(1)
        });
    }

    return data;
};

const roomEnergyData = [
    {name: 'Salon', value: 35},
    {name: 'Kuchnia', value: 25},
    {name: 'Sypialnia', value: 20},
    {name: 'Łazienka', value: 12},
    {name: 'Gabinet', value: 8}
];

const floorEnergyData = [
    {name: 'Parter', value: 45},
    {name: 'I piętro', value: 35},
    {name: 'II piętro', value: 20}
];

const lightsData = {
    total: 42,
    on: 18,
    off: 24
};

const statsData = {
    dailyUsage: '45.2 kWh',
    monthlyUsage: '1356 kWh',
    avgDailyUsage: '45.2 kWh',
    peakHour: '19:00 - 20:00',
    avgTemperature: '20.5°C'
};

const BuildingCharts = () => {
    const energyData = generateEnergyData();
    const temperatureData = generateTemperatureData();
    const currentHourIndex = energyData.findIndex(item => item.type === 'Predykcja');
    const referenceLineTime = energyData[currentHourIndex > 0 ? currentHourIndex - 1 : 0].time;

    return (
        <Box sx={{p: 3}}>
            <Typography variant="h4" gutterBottom>
                Monitorowanie Domu
            </Typography>

            {/* Sekcja Energia */}
            <Paper sx={{p: 3, mb: 3}}>
                <Typography variant="h5" gutterBottom>
                    Energia
                </Typography>
                <Divider sx={{mb: 3}}/>

                <Grid container spacing={3}>
                    <Grid size={{xs: 12, md: 8}}>
                        <Typography variant="h6" gutterBottom>
                            Zużycie energii elektrycznej (kWh) - ostatnie 24h + predykcja
                        </Typography>

                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={energyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                <XAxis
                                    dataKey="time"
                                    tick={{fontSize: 11, angle: -35}} // Obrót tekstu
                                    interval={3} // Co 4. punkt (0, 3, 6, 9, ...)
                                    tickFormatter={(value) => {
                                        // Format typu '2025-07-27 14:00' -> '27 14:00'
                                        const date = new Date(value);
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const hour = String(date.getHours()).padStart(2, '0');
                                        return `${day} ${hour}:00`;
                                    }}
                                />

                                <YAxis
                                    label={{value: 'kWh', angle: -90, position: 'insideLeft'}}
                                    domain={[0, 3]}
                                />
                                <Tooltip
                                    formatter={(value, name) => [`${value} kWh`, name === 'prediction' ? 'Predykcja' : 'Zużycie energii']}
                                    labelFormatter={(label) => `Godzina: ${label}`}
                                />
                                <Legend/>

                                {/* Dane rzeczywiste – dzień 1 */}
                                <Line
                                    dataKey="usage"
                                    name="Rzeczywiste"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{r: 6}}
                                    isAnimationActive={false}
                                />

                                {/* Dane predykcji – dzień 2 */}
                                <Line
                                    dataKey="prediction"
                                    name="Predykcja (jutro)"
                                    stroke="#ff7300"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>


                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 2, gap: 2}}>
                            <Chip
                                label="Dane rzeczywiste"
                                sx={{backgroundColor: '#8884d8', color: 'white'}}
                            />
                            <Chip
                                label="Predykcja"
                                sx={{backgroundColor: '#82ca9d', color: 'white'}}
                            />
                        </Box>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}}>
                        <Typography variant="h6" gutterBottom>
                            Statystyki energii
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Paper sx={{p: 2}}>
                                <Typography>Dzienne zużycie:</Typography>
                                <Typography variant="h5">{statsData.dailyUsage}</Typography>
                            </Paper>
                            <Paper sx={{p: 2}}>
                                <Typography>Miesięczne zużycie:</Typography>
                                <Typography variant="h5">{statsData.monthlyUsage}</Typography>
                            </Paper>
                            <Paper sx={{p: 2}}>
                                <Typography>Średnie dzienne zużycie:</Typography>
                                <Typography variant="h5">{statsData.avgDailyUsage}</Typography>
                            </Paper>
                            <Paper sx={{p: 2}}>
                                <Typography>Godzina szczytu:</Typography>
                                <Typography variant="h5">{statsData.peakHour}</Typography>
                            </Paper>
                        </Box>
                    </Grid>

                    <Grid size={{xs: 12, md: 6}}>
                        <Typography variant="h6" gutterBottom>
                            Zużycie energii według pomieszczeń
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={roomEnergyData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {roomEnergyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>

                    <Grid size={{xs: 12, md: 6}}>
                        <Typography variant="h6" gutterBottom>
                            Zużycie energii według pięter
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={floorEnergyData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {floorEnergyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </Paper>

            {/* Sekcja Światło */}
            <Paper sx={{p: 3, mb: 3}}>
                <Typography variant="h5" gutterBottom>
                    Światło
                </Typography>
                <Divider sx={{mb: 3}}/>

                <Grid container spacing={3} alignItems="center">
                    <Grid size={{xs: 12, md: 6}}>
                        <Typography variant="h6" gutterBottom>
                            Status lamp
                        </Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Chip
                                label={`Włączone: ${lightsData.on}`}
                                color="success"
                                variant="outlined"
                                sx={{fontSize: '1.2rem', p: 2}}
                            />
                            <Chip
                                label={`Wyłączone: ${lightsData.off}`}
                                color="default"
                                variant="outlined"
                                sx={{fontSize: '1.2rem', p: 2}}
                            />
                            <Chip
                                label={`Razem: ${lightsData.total}`}
                                color="primary"
                                sx={{fontSize: '1.2rem', p: 2}}
                            />
                        </Box>
                    </Grid>

                    <Grid size={{xs: 12, md: 6}}>
                        <Typography variant="h6" gutterBottom>
                            Rozkład statusu lamp
                        </Typography>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                                {name: 'Włączone', value: lightsData.on},
                                {name: 'Wyłączone', value: lightsData.off}
                            ]}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="value">
                                    <Cell fill="#00C49F"/>
                                    <Cell fill="#FF8042"/>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </Paper>

            {/* Sekcja Temperatura */}
            <Paper sx={{p: 3}}>
                <Typography variant="h5" gutterBottom>
                    Temperatura
                </Typography>
                <Divider sx={{mb: 3}}/>

                <Grid container spacing={3}>
                    <Grid size={{xs: 12, md: 8}}>
                        <Typography variant="h6" gutterBottom>
                            Średnia temperatura (°C) - ostatnie 24h
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={temperatureData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="time"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Line
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#FF8042"
                                    strokeWidth={2}
                                    activeDot={{r: 8}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Grid>

                    <Grid size={{xs: 12, md: 4}}>
                        <Typography variant="h6" gutterBottom>
                            Statystyki temperatury
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Paper sx={{p: 2}}>
                                <Typography>Średnia temperatura:</Typography>
                                <Typography variant="h5">{statsData.avgTemperature}</Typography>
                            </Paper>
                            <Paper sx={{p: 2}}>
                                <Typography>Minimalna temperatura:</Typography>
                                <Typography variant="h5">18.2°C</Typography>
                            </Paper>
                            <Paper sx={{p: 2}}>
                                <Typography>Maksymalna temperatura:</Typography>
                                <Typography variant="h5">23.7°C</Typography>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default BuildingCharts;