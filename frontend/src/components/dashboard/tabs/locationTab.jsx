import React from 'react';
import {Box, CardContent, Chip, Divider, Grid, Typography} from "@mui/material";
import {Air, Lightbulb, Opacity, ShowChart, Thermostat} from "@mui/icons-material";

const LocationTab = () => {

    // Chart data
    // const temperatureData = {
    //   labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    //   datasets: [{
    //     label: 'Temperature (°C)',
    //     data: generateTimeData(24, 18, 28),
    //     borderColor: '#FF6384',
    //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //     tension: 0.4,
    //     fill: true
    //   }]
    // };

    const humidityData = {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
            label: 'Humidity (%)',
            data: generateTimeData(24, 30, 70),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    const lightData = {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
            label: 'Light Intensity (lux)',
            data: generateTimeData(24, 0, 1000),
            borderColor: '#FFCE56',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    const energyPredictionData = {
        labels: ['Current', 'Predicted'],
        datasets: [{
            label: 'Energy Usage (kWh)',
            data: [120, 145],
            backgroundColor: ['#4BC0C0', '#9966FF'],
            borderWidth: 1
        }]
    };

    const airQualityData = {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
            label: 'Air Quality Index',
            data: generateTimeData(24, 0, 100),
            borderColor: '#9966FF',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    const energyUsageData = {
        labels: locations,
        datasets: [{
            label: 'Energy Usage (kWh)',
            data: [120, 90, 75, 50],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)'
            ],
            borderWidth: 1
        }]
    };

    return (
        <div>
            {/* Temperature Card */}
            <Grid size={{sx: 12, md: 6, lg: 4}}>
                <StyledCard>
                    <CardContent>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Thermostat color="error" sx={{fontSize: 40, mr: 2}}/>
                            <Typography variant="h6">Temperature Analysis</Typography>
                            <Chip label="Live" color="success" size="small" sx={{ml: 'auto'}}/>
                        </Box>
                        <Divider sx={{my: 2}}/>
                        <ChartContainer>
                            <ChartComponent
                                type="line"
                                data={temperatureData}

                            />
                        </ChartContainer>
                    </CardContent>
                </StyledCard>
            </Grid>

            {/* Humidity Card */}
            <Grid size={{sx: 12, md: 6, lg: 4}}>
                <StyledCard>
                    <CardContent>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Opacity color="info" sx={{fontSize: 40, mr: 2}}/>
                            <Typography variant="h6">Humidity Levels</Typography>
                        </Box>
                        <Divider sx={{my: 2}}/>
                        <ChartContainer>
                            <ChartComponent
                                type="line"
                                data={humidityData}
                                options={{
                                    scales: {
                                        y: {
                                            beginAtZero: false,
                                            min: 20,
                                            max: 80
                                        }
                                    }
                                }}
                            />
                        </ChartContainer>
                    </CardContent>
                </StyledCard>
            </Grid>

            {/* Light Card */}
            <Grid size={{sx: 12, md: 6, lg: 4}}>
                <StyledCard>
                    <CardContent>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Lightbulb color="warning" sx={{fontSize: 40, mr: 2}}/>
                            <Typography variant="h6">Light Intensity</Typography>
                        </Box>
                        <Divider sx={{my: 2}}/>
                        <ChartContainer>
                            <ChartComponent
                                type="line"
                                data={lightData}
                                options={{
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 1200
                                        }
                                    }
                                }}
                            />
                        </ChartContainer>
                    </CardContent>
                </StyledCard>
            </Grid>

            {/* Energy Prediction Card */}
            <Grid size={{sx: 12, md: 6, lg: 4}}>
                <StyledCard>
                    <CardContent>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <ShowChart color="success" sx={{fontSize: 40, mr: 2}}/>
                            <Typography variant="h6">Energy Consumption Prediction</Typography>
                            <Chip label="AI Prediction" color="primary" size="small" sx={{ml: 'auto'}}/>
                        </Box>
                        <Divider sx={{my: 2}}/>
                        <ChartContainer>
                            <ChartComponent
                                type="bar"
                                data={energyPredictionData}
                                options={{
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </ChartContainer>
                    </CardContent>
                </StyledCard>
            </Grid>

            {/* Air Quality Card */}
            <Grid size={{sx: 12, md: 6, lg: 4}}>
                <StyledCard>
                    <CardContent>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Air color="secondary" sx={{fontSize: 40, mr: 2}}/>
                            <Typography variant="h6">Air Quality Index</Typography>
                        </Box>
                        <Divider sx={{my: 2}}/>
                        <ChartContainer>
                            <ChartComponent
                                type="line"
                                data={airQualityData}
                                options={{
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100
                                        }
                                    }
                                }}
                            />
                        </ChartContainer>
                    </CardContent>
                </StyledCard>
            </Grid>
        </div>
    );
};

export default LocationTab;