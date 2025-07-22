import React, {useState} from 'react';
import {
    Box, Button,
    Card,
    CardContent, Checkbox, Chip, IconButton,
    Skeleton,
    Table, TableBody,
    TableCell, TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import {
    CheckBox,
    CheckBoxOutlineBlank,
    CheckBoxOutlined,
    CheckCircleOutline,
    CheckCircleOutlineOutlined, Dangerous,
    InfoOutlined,
    RadioButtonChecked,
    RemoveCircleOutline,
    Warning
} from "@mui/icons-material";
import {format} from "date-fns";
import {pl} from "date-fns/locale";
import {styled} from "@mui/material/styles";
import {useNavigate} from "react-router-dom";
import client from "../../client.jsx";
import {API_BASE_URL} from "../../config.jsx";

const StyledCard = styled(Card)(({theme}) => ({
    height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': {
        transform: 'scale(1.02)', boxShadow: theme.shadows[4]
    }
}));

const AlarmsTab = ({alarms, setAlarms, loading, type}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();
    const token = localStorage.getItem("access");

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const handleDanger = async (alarmID) => {
        await client.put(API_BASE_URL + `action/${alarmID}/`,
            {
                isDanger: true,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

         setAlarms((prev) => prev.map((a) => a.action_id === alarmID ? {
                ...a,
                status: a.status === "HIGH"? "NORMAL": "HIGH"
            } : a));
    };


    const handleAcknowledge = async (alarmID) => {
        await client.put(API_BASE_URL + `action/${alarmID}/`,
            {
                isAcknowledged: true,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setAlarms((prev) => prev.map((a) => a.action_id === alarmID ? {
            ...a,
            isAcknowledged: !a.isAcknowledged
        } : a));
    };

    return (
        <>
            {alarms.length === 0 ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    textAlign: 'center'

                }}>
                    <InfoOutlined color="disabled" sx={{fontSize: 48, mb: 2}}/>
                    <Typography variant="h6" color="text.secondary">
                        Brak alarmów do wyświetlenia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Alarmy zostaną wyświetlone, gdy się pojawią
                    </Typography>
                </Box>) : (
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Wartość</TableCell>
                                    <TableCell>Alarm</TableCell>
                                    <TableCell>Data pomiaru</TableCell>
                                    <TableCell>Czujnik</TableCell>
                                    <TableCell>Powód</TableCell>
                                    <TableCell>Akcje</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (<TableRow>
                                    <TableCell colSpan={3}>
                                        <Skeleton height={40}/>
                                    </TableCell>
                                </TableRow>) : alarms.length > 0 ? (alarms
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((alarm) => (<TableRow key={alarm.action_id}>
                                        <TableCell>
                                            {alarm.measurement.sensor.data_type === "LIGHT"? `${Boolean(parseInt(alarm?.measurement?.value) === 1)}`:
                                            (`${Math.round(alarm?.measurement?.value * 100) / 100} ${alarm?.measurement?.sensor.unit}`)}
                                        </TableCell>
                                        <TableCell>
                                            {alarm.status === "MEDIUM" ?
                                                <Warning color="warning"/> : (alarm.status === "LOW" ?
                                                    <Warning sx={{color: "#f2c42b"}}/> : (alarm.status === "HIGH" ?
                                                        <Warning color={"error"}/> : "---"))}

                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(alarm.created_at), 'PPpp', {locale: pl})}
                                        </TableCell>

                                            <TableCell>
                                                <Chip label={alarm.measurement.sensor.visibleName} variant={"outlined"}
                                                      size={"small"}
                                                      onClick={() => navigate(`/sensor/${alarm.measurement.sensor.sensor_id}`)}/>
                                            </TableCell>
                                        <TableCell>
                                            {alarm.description}
                                        </TableCell>
                                        <TableCell sx={{padding: '4px', width: '80px'}}>
                                            {alarm.status !== "NORMAL"? (
                                                <Box sx={{display: 'flex'}}>
                                                    <IconButton size="small" onClick={()=> handleDanger(alarm.action_id)}>
                                                        <RemoveCircleOutline fontSize="small" color="action"/>
                                                    </IconButton>
                                                    <IconButton size="small" onClick={()=> handleAcknowledge(alarm.action_id)}>
                                                        {alarm.isAcknowledged? <CheckBox fontSize="small" color="action"/>:
                                                        <CheckBoxOutlineBlank fontSize="small" color="action"/>}
                                                    </IconButton>
                                                </Box>
                                            ):
                                                <Box sx={{display: 'flex', gap: '4px'}}>
                                                    <IconButton size="small" onClick={()=> handleDanger(alarm.action_id)}>
                                                        <Dangerous fontSize="small" color="error"/>
                                                    </IconButton>
                                                </Box>
                                            }
                                        </TableCell>
                                    </TableRow>))) : (<TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography variant="body1" color="text.secondary">
                                            Brak danych pomiarowych
                                        </Typography>
                                    </TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={alarms.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            borderTop: "1px solid",
                            borderColor: "divider",
                            // Styles applied directly to the toolbar using its class
                            '& .MuiTablePagination-toolbar': {
                                display: 'flex',      // Make it a flex container
                                alignItems: 'center', // Vertically center all items within this toolbar

                            },
                            '& .MuiTablePagination-selectLabel': {
                                margin: 0,
                                padding: 0,
                            }, '& .MuiTablePagination-displayedRows': {
                                margin: 0,
                                padding: 0,
                            },
                            // Opcjonalne dla samego select'a, jeśli ma dziwny offset
                            '& .MuiTablePagination-select': {
                                // margin: 0,
                                // padding: 0,
                            }

                        }}
                        labelRowsPerPage={"Wyniki na stronę:"}
                        labelDisplayedRows={({from, to, count}) =>
                            `${from}–${to} z ${count !== -1 ? count : `ponad ${to}`}`
                        }
                    />
                </CardContent>
            )}

        </>
    );
};

export default AlarmsTab;