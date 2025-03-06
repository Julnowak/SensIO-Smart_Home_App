import { useState } from "react";

const exampleLogs = [
  { id: 1, time: "2025-03-05T14:30:00", name: "Otwarto okno", type: "manual" },
  { id: 2, time: "2025-03-05T15:00:00", name: "Zamknięto drzwi", type: "automatic" },
  { id: 3, time: "2025-03-05T16:15:00", name: "Włączono światło", type: "manual" },
];


function History() {
const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: "", type: "", time: "" });

  const filteredLogs = exampleLogs.filter((log) =>
    (filters.name === "" || log.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.type === "" || log.type === filters.type) &&
    (filters.time === "" || log.time.startsWith(filters.time))
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Logi systemu Smart Home</h1>
      <div className="row mb-3">
        <div className="col">
          <input className="form-control" placeholder="Filtruj po nazwie" onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        </div>
        <div className="col">
          <select className="form-select" onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Wszystkie</option>
            <option value="manual">Ręczne</option>
            <option value="automatic">Automatyczne</option>
          </select>
        </div>
        <div className="col">
          <input className="form-control" type="datetime-local" onChange={(e) => setFilters({ ...filters, time: e.target.value })} />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={() => setPage(1)}>Filtruj</button>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Czas</th>
            <th>Akcja</th>
            <th>Typ</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>{log.name}</td>
              <td>{log.type === "manual" ? "Ręczne" : "Automatyczne"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Poprzednia</button>
        <input className="form-control text-center" style={{ width: "60px" }} type="number" value={page} onChange={(e) => setPage(Number(e.target.value))} />
        <button className="btn btn-secondary" disabled={filteredLogs.length < 1} onClick={() => setPage(page + 1)}>Następna</button>
      </div>
    </div>
  );
}

export default History;