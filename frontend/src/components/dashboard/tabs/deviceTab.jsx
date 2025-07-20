import React from 'react';
import {Box, Card, CardContent, CardHeader, Grid, Typography} from "@mui/material";
import {BarChart, LineChart} from "@mui/x-charts";

const DeviceTab = () => {
    return (
        <div>
            <Box sx={{p: 3}}>
                            <Typography variant="h5" gutterBottom>
                                Wykresy czujników - Urządzenie
                            </Typography>

                            <Grid container spacing={3}>
                                {filteredSensors?.map(({sensor, measurements}) => {
                                    const chartType = getChartType(sensor?.data_type);
                                    const chartColor = getChartColor(sensor?.data_type);

                                    const chartData = {
                                        labels: measurements?.map(m => m.created_at),
                                        datasets: [
                                            {
                                                label: sensor?.visibleName || sensor?.name,
                                                data: measurements?.map(m => m.value),
                                                borderColor: chartColor,
                                                backgroundColor: `${chartColor}40`,
                                                borderWidth: 2,
                                                tension: 0.1
                                            }
                                        ]
                                    };

                                    const chartOptions = {
                                        responsive: true,
                                        scales: {
                                            x: {
                                                type: 'time',
                                                time: {
                                                    unit: 'hour',
                                                    tooltipFormat: 'PPpp'
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Czas'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: sensor?.unit || 'Wartość'
                                                }
                                            }
                                        }
                                    };

                                    return (
                                        <Grid item xs={12} md={6} lg={4} key={sensor?.sensor_id}>
                                            <Card elevation={3}>
                                                <CardHeader
                                                    title={sensor?.visibleName || sensor?.name}
                                                    // subheader={`${sensor.get_data_type_display()} ${sensor.unit ? `(${sensor.unit})` : ''}`}
                                                />
                                                <CardContent sx={{height: 300}}>
                                                    {chartType === 'line' ? (
                                                        <LineChart
                                                            xAxis={[{
                                                                scaleType: 'time',
                                                                data: measurements?.map(m => m.created_at),
                                                                label: 'Czas'
                                                            }]}
                                                            yAxis={[{
                                                                label: sensor?.unit || 'Wartość'
                                                            }]}
                                                            series={[{
                                                                data: measurements?.map(m => m.value),
                                                                label: sensor?.visibleName,
                                                                color: chartColor
                                                            }]}
                                                        />
                                                    ) : (
                                                        <BarChart
                                                            xAxis={[{
                                                                scaleType: 'band',
                                                                data: measurements?.map(m => m.created_at.toLocaleTimeString()),
                                                                label: 'Czas'
                                                            }]}
                                                            yAxis={[{
                                                                label: sensor?.unit || 'Wartość'
                                                            }]}
                                                            series={[{
                                                                data: measurements?.map(m => m.value),
                                                                label: sensor?.visibleName,
                                                                color: chartColor
                                                            }]}
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
        </div>
    );
};

export default DeviceTab;