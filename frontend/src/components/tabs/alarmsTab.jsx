import React, {useState} from 'react';
import {
    Box,
    Card,
    CardContent, Chip,
    Skeleton,
    Table, TableBody,
    TableCell, TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import {CheckCircleOutline, InfoOutlined, RadioButtonChecked, RemoveCircleOutline, Warning} from "@mui/icons-material";
import {format} from "date-fns";
import {pl} from "date-fns/locale";
import {styled} from "@mui/material/styles";
import {useNavigate} from "react-router-dom";

const StyledCard = styled(Card)(({theme}) => ({
    height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': {
        transform: 'scale(1.02)', boxShadow: theme.shadows[4]
    }
}));

const AlarmsTab = ({alarms, loading, type}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
                                    {type === "device"? <TableCell>Czujnik</TableCell>: null}
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
                                            {Math.round(alarm?.measurement.value * 100) / 100} {alarm?.measurement?.sensor.unit}
                                        </TableCell>
                                        <TableCell>
                                            {alarm.status === "MEDIUM" ?
                                                <Warning color="warning"/> : (alarm.status === "LOW" ?
                                                    <Warning color="yellow"/> : "---")}

                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(alarm.created_at), 'PPpp', {locale: pl})}
                                        </TableCell>
                                        {type === "device"?
                                            <TableCell>
                                                <Chip label={alarm.measurement.sensor.visibleName} variant={"outlined"} size={"small"} onClick={()=> navigate(`/sensor/${alarm.measurement.sensor.sensor_id}`)}/>
                                            </TableCell>:null}
                                        <TableCell>
                                            {alarm.description}
                                        </TableCell>
                                        <TableCell>
                                            {alarm.status !== "NORMAL" ? <>
                                                <RemoveCircleOutline color="error"/>
                                                {!alarm.isAcknowledged ? <RadioButtonChecked/> :
                                                    <CheckCircleOutline/>}
                                            </> : null}
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
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={alarms.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Wierszy na stronę:"
                        labelDisplayedRows={({from, to, count}) => `${from}-${to} z ${count}`}
                    />
                </CardContent>
            )}

        </>
    );
};

export default AlarmsTab;