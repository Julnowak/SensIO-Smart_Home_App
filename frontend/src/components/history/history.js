import React, {useState} from "react";
import Paginator from "../../paginator/paginator";

const exampleLogs = [
    {id: 1, time: "2025-03-05T14:30:00", name: "Otwarto okno", type: "manual"},
    {id: 2, time: "2025-03-05T15:00:00", name: "Zamknięto drzwi", type: "automatic"},
    {id: 3, time: "2025-03-05T16:15:00", name: "Włączono światło", type: "manual"},
];


function History() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [filters, setFilters] = useState({name: "", type: "", time: ""});

    const filteredLogs = exampleLogs.filter((log) =>
        (filters.name === "" || log.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.type === "" || log.type === filters.type) &&
        (filters.time === "" || log.time.startsWith(filters.time))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    return (
        <div style={{maxWidth: 1000, margin: "auto"}}>
            <div style={{maxWidth: 1000, padding: "20px"}}>
                <h1 className="mb-4">Logi systemu Smart Home</h1>
                <div className="row mb-3">
                    <div className="col">
                        <input className="form-control" placeholder="Filtruj po nazwie"
                               onChange={(e) => setFilters({...filters, name: e.target.value})}/>
                    </div>
                    <div className="col">
                        <select className="form-select"
                                onChange={(e) => setFilters({...filters, type: e.target.value})}>
                            <option value="">Wszystkie</option>
                            <option value="manual">Ręczne</option>
                            <option value="automatic">Automatyczne</option>
                        </select>
                    </div>
                    <div className="col">
                        <input className="form-control" type="datetime-local"
                               onChange={(e) => setFilters({...filters, time: e.target.value})}/>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary">Filtruj</button>
                    </div>
                </div>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Czas</th>
                        <th>Akcja</th>
                        <th>Typ</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredLogs.map((log) => (
                        <tr key={log.id}>
                            <td>{new Date(log.time).toLocaleString()}</td>
                            <td>{log.name}</td>
                            <td>{log.type === "manual" ? "Ręczne" : "Automatyczne"}</td>
                            <td><button>X</button><button>E</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Paginator totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </div>
        </div>
    );
}

export default History;