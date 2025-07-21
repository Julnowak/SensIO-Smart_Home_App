import React, {useState} from 'react';
import {
    Box,
    Typography,
    Paper,
    useTheme,
    Tooltip,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider,
    Stack
} from '@mui/material';
import {
    PieChart,
    BarChart,
    LineChart
} from '@mui/x-charts';
import {
    useDrawingArea,
} from '@mui/x-charts/hooks';
import {styled} from '@mui/material/styles';
import {
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    ShowChart as LineChartIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon, Warning
} from '@mui/icons-material';
import ActionStackedChart from "./stackedActionChart.jsx";
import {pl} from "date-fns/locale";
import {format} from "date-fns";

const StyledText = styled('text')(({theme}) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 20,
    fontWeight: 'bold',
}));

function PieCenterLabel({children}) {
    const {width, height, left, top} = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}

const AlarmStatistics = ({stats, actions, onRefresh}) => {
    const theme = useTheme();
    const [chartType, setChartType] = useState('pie');
    const [timeRange, setTimeRange] = useState('24h');
    const [activeFilter, setActiveFilter] = useState(['errors', 'warnings', 'info']);

    // Dane wykresu
    const chartData = [
        {
            id: 0,
            value: stats.errors,
            label: 'Ostrzeżenia krytyczne',
            color: theme.palette.error.main,
            icon: <WarningIcon color="error"/>,
            type: 'errors'
        },
        {
            id: 1,
            value: stats.mediums,
            label: 'Ostrzeżenia średnie',
            color: theme.palette.warning.main,
            icon: <WarningIcon color="warning"/>,
            type: 'warnings'
        },
        {
            id: 1,
            value: stats.warnings,
            label: 'Ostrzeżenia niskie',
            color: '#f4c52b',
            icon: <Warning color="disabled" sx={{ color: "#f4c52b" }}/>,
            type: 'warnings'
        },
        {
            id: 2,
            value: stats.info,
            label: 'Informacje',
            color: theme.palette.info.main,
            icon: <InfoIcon color="info"/>,
            type: 'info'
        },
    ];

    const filteredData = chartData.filter(item => activeFilter.includes(item.type));
    const totalAlarms = filteredData.reduce((sum, item) => sum + item.value, 0);

    const handleFilterToggle = (type) => {
        setActiveFilter(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    return (
        <Box sx={{pb: 2}}>
            {/* Nagłówek i kontrole */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Tooltip title={"Odśwież"}>
                    <Typography variant="h4"  sx={{fontWeight: 600}}>
                        Historia zdarzeń i alarmów
                    </Typography>
                </Tooltip>

                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={onRefresh} color="primary" aria-label="Odśwież">
                        <RefreshIcon/>
                    </IconButton>
                </Stack>
            </Box>

            {/* Filtry */}
            <Box sx={{mb: 3}}>
                <Stack direction="row" spacing={1}>
                    {chartData.map((item) => (
                        <Chip
                            key={item.id}
                            icon={item.icon}
                            label={`${item.label} (${item.value})`}
                            variant={activeFilter.includes(item.type) ? 'filled' : 'outlined'}
                            onClick={() => handleFilterToggle(item.type)}
                            sx={{
                                borderColor: activeFilter.includes(item.type) ? item.color : undefined,
                                backgroundColor: activeFilter.includes(item.type) ? `${item.color}20` : undefined
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 8}}>
                    <Card elevation={3} sx={{height: '100%', borderRadius: 2}}>
                        <CardContent sx={{display: 'flex', flexDirection: 'column', height: '100%', padding: 2}}>
                            {chartType === 'pie' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: '100%',
                                        minHeight: 600,
                                        maxHeight: 800,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            '& .MuiChartsAxis-directionX': {
                                                display: 'none',
                                            },
                                        }}
                                    >
                                        {actions.length !== 0 && (<ActionStackedChart actions={actions} granularity={"day"}/>)}
                                    </Box>

                                    <Box
                                        sx={{
                                            width: '30%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingLeft: 2,
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: 300
                                            }}
                                        >
                                            <PieChart
                                                series={[
                                                    {
                                                        data: filteredData,
                                                        innerRadius: 60,
                                                        outerRadius: 100,
                                                        paddingAngle: 2,
                                                        cornerRadius: 4,
                                                        highlightScope: {
                                                            highlighted: 'item',
                                                            faded: 'global',
                                                        },
                                                        faded: {
                                                            innerRadius: 30,
                                                            additionalRadius: -10,
                                                            color: 'gray',
                                                        },
                                                    },
                                                ]}
                                                slotProps={{
                                                    legend: {
                                                        hidden: true,
                                                    },
                                                }}
                                            >
                                                <PieCenterLabel>{totalAlarms}</PieCenterLabel>
                                            </PieChart>
                                        </Box>

                                        <Box
                                            sx={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: 300
                                            }}
                                        >
                                            <BarChart
                                                series={filteredData.map((item) => ({
                                                    data: [item.value],
                                                    color: item.color,
                                                    label: item.label,
                                                }))}
                                                margin={{top: 20, bottom: 20, left: 20, right: 20}}
                                                slotProps={{
                                                    legend: {
                                                        hidden: true,
                                                    },
                                                }}

                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                </Grid>

                <Grid size={{xs: 12, md: 4}}>
                    <Card elevation={3} sx={{height: '100%', borderRadius: 2}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Podsumowanie alarmów
                            </Typography>
                            <Divider sx={{my: 2}}/>

                            <Stack spacing={2}>
                                {chartData.map((item) => (
                                    <Paper
                                        key={item.id}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderLeft: `4px solid ${item.color}`,
                                            backgroundColor: theme.palette.background.default,
                                            borderRadius: 1,
                                            transition: 'all 0.2s ease',
                                            opacity: activeFilter.includes(item.type) ? 1 : 0.5,
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: theme.shadows[2],
                                            }
                                        }}
                                    >
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            {item.icon}
                                            <Typography variant="subtitle1" sx={{flexGrow: 1}}>
                                                {item.label}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold">
                                                {item.value}
                                            </Typography>
                                        </Box>
                                        {totalAlarms > 0 && (
                                            <Box sx={{mt: 1}}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {Math.round((item.value / totalAlarms) * 100)}% wszystkich zdarzeń
                                                </Typography>
                                                <Box sx={{
                                                    height: 4,
                                                    width: '100%',
                                                    bgcolor: theme.palette.action.disabledBackground,
                                                    mt: 1,
                                                    borderRadius: 2,
                                                    overflow: 'hidden'
                                                }}>
                                                    <Box sx={{
                                                        height: '100%',
                                                        width: `${(item.value / totalAlarms) * 100}%`,
                                                        bgcolor: item.color
                                                    }}/>
                                                </Box>
                                            </Box>
                                        )}
                                    </Paper>
                                ))}
                            </Stack>

                            <Divider sx={{my: 3}}/>

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ostatnia aktualizacja:
                                </Typography>
                                <Typography variant="body2">
                                    {new Date(stats?.lastUpdate).toLocaleDateString()}, {new Date(stats?.lastUpdate).toLocaleTimeString()}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AlarmStatistics;