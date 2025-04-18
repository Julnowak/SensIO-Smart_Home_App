import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Typography,
  TablePagination
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from "@mui/icons-material";

const exampleLogs = [
  {id: 1, time: "2025-03-05T14:30:00", name: "Otwarto okno", type: "manual", device_id: 101},
  {id: 2, time: "2025-03-05T15:00:00", name: "Zamknięto drzwi", type: "automatic", device_id: 102},
  {id: 3, time: "2025-03-05T16:15:00", name: "Włączono światło", type: "manual", device_id: 103},
];

function History() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({ name: "", type: "", time: "" });

  const filteredLogs = exampleLogs.filter((log) =>
    (filters.name === "" || log.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.type === "" || log.type === filters.type) &&
    (filters.time === "" || log.time.startsWith(filters.time))
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Logi systemu Smart Home
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Filtruj po nazwie"
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            onChange={(e) => setFilters({...filters, name: e.target.value})}
          />

          <Select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            displayEmpty
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Wszystkie typy</MenuItem>
            <MenuItem value="manual">Ręczne</MenuItem>
            <MenuItem value="automatic">Automatyczne</MenuItem>
          </Select>

          <TextField
            type="datetime-local"
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setFilters({...filters, time: e.target.value})}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ px: 4 }}
          >
            Filtruj
          </Button>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="historia zdarzeń">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell>Czas</TableCell>
                <TableCell>ID Urządzenia</TableCell>
                <TableCell>Akcja</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell align="right">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      {new Date(log.time).toLocaleString()}
                    </TableCell>
                    <TableCell>#{log.device_id}</TableCell>
                    <TableCell>{log.name}</TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: log.type === 'manual' ? 'info.light' : 'success.light',
                          color: log.type === 'manual' ? 'info.dark' : 'success.dark'
                        }}
                      >
                        {log.type === "manual" ? "Ręczne" : "Automatyczne"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="edit" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label="delete" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Wierszy na stronę:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
        />
      </Paper>
    </Container>
  );
}

export default History;