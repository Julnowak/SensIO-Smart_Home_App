import React, {useEffect, useRef} from 'react';
import {Typography} from '@mui/material';
import {Chart} from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const SensorChart = ({measurements}) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const getTimeUnit = (measurements) => {
        const timestamps = measurements.map(m => new Date(m.created_at));
        const min = Math.min(...timestamps);
        const max = Math.max(...timestamps);
        const diffHours = (max - min) / (1000 * 60 * 60);

        if (diffHours <= 24) return 'hour';
        if (diffHours <= 24 * 7) return 'day';
        return 'week';
    };


    useEffect(() => {
        if (!measurements || measurements.length === 0) return;

        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const ctx = chartRef.current.getContext('2d');

            const normalMeasurements = measurements;
            const warningMeasurements = measurements.filter(
                (m) => m.warning && m.warning !== 'NORMAL'
            );

            const normalDataset = {
                label: 'Normalne wartości',
                data: normalMeasurements.map((m) => ({
                    x: new Date(m.created_at),
                    y: m.value,
                })),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2,
                fill: false,
            };

            const warningGroups = {
                LOW: warningMeasurements.filter((m) => m.warning === 'LOW'),
                MEDIUM: warningMeasurements.filter((m) => m.warning === 'MEDIUM'),
                HIGH: warningMeasurements.filter((m) => m.warning === 'HIGH'),
            };

            const warningColors = {
                LOW: 'yellow',
                MEDIUM: 'orange',
                HIGH: 'red',
            };

            const warningDatasets = Object.entries(warningGroups)
                .map(([type, group]) => {
                    if (group.length === 0) return null;

                    return {
                        label: `Ostrzeżenie: ${type.toLowerCase()}`,
                        data: group.map((m) => ({
                            x: new Date(m.created_at),
                            y: m.value,
                        })),
                        backgroundColor: warningColors[type],
                        borderColor: '#000',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        borderWidth: 1.5,
                        pointStyle: 'circle',
                        showLine: false,
                    };
                })
                .filter(Boolean);

            const labels = normalMeasurements.map((m) => new Date(m.created_at));

            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [normalDataset, ...warningDatasets],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                            },
                        },
                        tooltip: {
                            callbacks: {
                                title: (items) => {
                                    const date = items[0].parsed.x;
                                    return new Date(date).toLocaleString('pl-PL', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                },
                                label: (context) => {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${value.toFixed(2)} kWh`;
                                },
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: getTimeUnit(measurements),
                                tooltipFormat: 'Pp',
                                displayFormats: {
                                    hour: 'HH:mm',
                                    day: 'dd MMM',
                                    week: 'dd MMM'
                                }
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 12
                            },
                            title: {
                                display: true,
                                text: 'Data i godzina'
                            }
                        },
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Wartość [kWh]',
                            },
                            ticks: {
                                stepSize: 1,
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [measurements]);

    if (!measurements || measurements.length === 0) {
        return <Typography>Brak danych do wyświetlenia</Typography>;
    }

    return <canvas ref={chartRef} style={{width: '100%', height: '400px'}}/>;
};

export default SensorChart;
