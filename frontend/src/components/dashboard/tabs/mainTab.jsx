import React from 'react';
import {Grid} from "@mui/material";
import EnergyDashboard from "../EnergyDashboard.jsx";
import StackedEnergyChart from "../stackedEnergyChart.jsx";
import Heatmap from "../heatmap.jsx";
import CalendarChart from "../heatmap.jsx";

const MainTab = ({measurements}) => {
    return (
        <Grid size={"grow"}>
            <Grid size={{sx: 12}}>
                <CalendarChart measurements={measurements}/>
            </Grid>

            <Grid size={{sx: 12}}>
                <EnergyDashboard measurements={measurements}/>
            </Grid>

            <Grid size={{sx: 12}}>
                <StackedEnergyChart/>
            </Grid>

            {/*<div style={{height: 400, marginBottom: 40}}>*/}
            {/*    <Typography variant="h6" gutterBottom>*/}
            {/*        Bar Chart - Porównanie zużycia między budynkami*/}
            {/*    </Typography>*/}
            {/*    <BarChart*/}
            {/*        series={[*/}
            {/*            {*/}
            {/*                data: barData.map(b => b.value),*/}
            {/*            }*/}
            {/*        ]}*/}
            {/*        xAxis={[*/}
            {/*            {*/}
            {/*                data: barData.map(b => b.name),*/}
            {/*                scaleType: 'band',*/}
            {/*            }*/}
            {/*        ]}*/}
            {/*        height={400}*/}
            {/*    />*/}
            {/*</div>*/}

            {/*<Grid size={{sx: 12}} >*/}
            {/*    <StyledCard>*/}
            {/*        <CardContent>*/}
            {/*            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>*/}
            {/*                /!*<PieChart sx={{ fontSize: 40, mr: 2, color: '#4BC0C0' }} />*!/*/}
            {/*                <Typography variant="h6" gutterBottom>*/}
            {/*                    Udział procentowy zużycia energii*/}
            {/*                </Typography>*/}
            {/*            </Box>*/}
            {/*            <Divider sx={{my: 2}}/>*/}
            {/*            <Box sx={{height: {xs: 300, sm: 400}}}>*/}
            {/*                <PieChart*/}
            {/*                    width={500} height={300}*/}
            {/*                    series={[*/}
            {/*                        {*/}
            {/*                            data: [*/}
            {/*                                {id: 0, value: 35, label: 'Budynek A'},*/}
            {/*                                {id: 1, value: 25, label: 'Budynek B'},*/}
            {/*                                {id: 2, value: 20, label: 'Budynek C'},*/}
            {/*                                {id: 3, value: 15, label: 'Budynek D'},*/}
            {/*                                {id: 4, value: 5, label: 'Inne'},*/}
            {/*                            ],*/}
            {/*                            innerRadius: 80,*/}
            {/*                            outerRadius: 150,*/}
            {/*                            paddingAngle: 2,*/}
            {/*                            cornerRadius: 5,*/}
            {/*                            highlightScope: {faded: 'global', highlighted: 'item'},*/}
            {/*                            faded: {innerRadius: 30, additionalRadius: -30, color: 'gray'},*/}
            {/*                        },*/}
            {/*                    ]}*/}
            {/*                    slotProps={{*/}
            {/*                        legend: {*/}
            {/*                            direction: 'row',*/}
            {/*                            position: {vertical: 'bottom', horizontal: 'middle'},*/}
            {/*                            padding: 0,*/}
            {/*                            labelStyle: {*/}
            {/*                                fontSize: 14,*/}
            {/*                                fill: theme.palette.text.primary,*/}
            {/*                            },*/}
            {/*                        },*/}
            {/*                    }}*/}
            {/*                />*/}
            {/*            </Box>*/}
            {/*        </CardContent>*/}
            {/*    </StyledCard>*/}
            {/*</Grid>*/}

        </Grid>
    );
};

export default MainTab;