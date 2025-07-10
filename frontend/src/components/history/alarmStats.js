import React from 'react';
import {Box, Typography, Paper, useTheme, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import {PieChart} from '@mui/x-charts/PieChart';

const AlarmStatistics = ({stats}) => {
    const theme = useTheme();

    // Dane wykresu
    const data = [
        {id: 0, value: stats.errors, label: 'Błąd krytyczny', color: theme.palette.error.main},
        {id: 1, value: stats.warnings, label: 'Ostrzeżenie', color: theme.palette.warning.main},
        {id: 2, value: stats.info, label: 'Informacja', color: theme.palette.info.main},
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Box sx={{p: 3, display: 'flex', flexDirection: {xs: 'column', md: 'row'}}}>
            {/* Wykres kołowy z dziurą */}
            <Box sx={{flex: 1, minWidth: 300, margin: "auto"}}>
                <PieChart
                    series={[
                        {
                            data,
                            innerRadius: 40,
                            paddingAngle: 2,
                            cornerRadius: 4,
                            highlightScope: {faded: 'global', highlighted: 'item'},
                            faded: {innerRadius: 30, additionalRadius: -10, color: 'gray'},
                        },
                    ]}
                    height={450}
                    margin={{bottom: 80, top: 20}}
                    slotProps={{
                        legend: { hidden: true }, // Ukrywamy domyślną legendę
                      }}
                />

            </Box>

            {/* Legenda z opisami */}
            <Box sx={{flex: 1, minWidth: 250}}>
                <Typography variant="h5" gutterBottom>
                    Aktualna lokacja:
                </Typography>
                <Box>
                    Zmień lokacje
                </Box>
            </Box>
        </Box>
    );
};

export default AlarmStatistics;