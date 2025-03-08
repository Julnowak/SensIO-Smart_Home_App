import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ChartComponent = ({ type, data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type,
      data,
    });
  }, [type, data]);

  return <canvas ref={chartRef}></canvas>;
};

const Dashboard = () => {
  const temperatureData = {
    labels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
    datasets: [
      {
        label: "Temperature (°C)",
        data: [21, 23, 27, 24, 22],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.5)",
      },
    ],
  };

  const humidityData = {
    labels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
    datasets: [
      {
        label: "Humidity (%)",
        data: [40, 45, 50, 55, 48],
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.5)",
      },
    ],
  };

  const energyUsageData = {
    labels: ["Living Room", "Kitchen", "Bedroom", "Bathroom"],
    datasets: [
      {
        label: "Energy Usage (kWh)",
        data: [120, 90, 75, 50],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
      },
    ],
  };

  const airQualityData = {
    labels: ["00:00", "06:00", "12:00", "18:00", "24:00"],
    datasets: [
      {
        label: "Air Quality Index",
        data: [50, 55, 60, 65, 58],
        borderColor: "#ff9800",
        backgroundColor: "rgba(255, 152, 0, 0.5)",
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Smart Home Dashboard</h1>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="text-center">Temperature Over Time</h5>
            <ChartComponent type="line" data={temperatureData} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="text-center">Humidity Over Time</h5>
            <ChartComponent type="line" data={humidityData} />
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="text-center">Energy Usage by Room</h5>
            <ChartComponent type="pie" data={energyUsageData} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="text-center">Air Quality Index</h5>
            <ChartComponent type="bar" data={airQualityData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;