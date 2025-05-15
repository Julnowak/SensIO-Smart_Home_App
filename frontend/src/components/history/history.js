import React, {useEffect, useState} from "react";
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
  TablePagination, Chip
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";

function History() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({ description: "", type: "", created_at: "" });
  const [logs, setLogs] = useState([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await client.get(API_BASE_URL + "actions", {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
              setLogs(response.data);
              console.log(response.data)
          } catch (error) {
              console.error("Failed to fetch logs", error);
          }
      };

      if (token) {
          fetchData();
      }
  }, [token]);

  const filteredLogs = logs.filter((log) =>
    (filters.description === "" || log.description.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.type === "" || log.type === filters.type) &&
    (filters.created_at === "" || log.created_at.startsWith(filters.time))
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
          Logi systemowe
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
            <MenuItem value="MANUAL">Ręczne</MenuItem>
            <MenuItem value="AUTO">Automatyczne</MenuItem>
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
                <TableCell>Urządzenie</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell>Wartość</TableCell>
                <TableCell align="center">Info</TableCell>
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
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>#{log.device.brand}_{log.device.serial_number}<br/>"{log.device.name}"</TableCell>
                    <TableCell>{log.description}</TableCell>

                    <TableCell>
                      {log.measurement?.value? log.measurement.value: "-----"}
                    </TableCell>

                    <TableCell align="right">
                      <Chip sx={{m:0.5}} label={`${log.device.room.home.name}`} color="primary" />
                      <Chip sx={{m:0.5}} label={`${log.device.room.name}`} color="secondary" />
                      <Chip sx={{m:0.5}} label={`${log.device.data_type}`} color="success" />
                      <Chip sx={{m:0.5}} label={log.type === "manual" ? "Ręczne" : "Automatyczne"} color="success" />
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