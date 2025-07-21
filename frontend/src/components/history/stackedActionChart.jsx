import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import dayjs from 'dayjs';

const prepareData = (actions, granularity = 'day') => {
  const grouped = {};

  actions.forEach((item) => {
    const date = dayjs(item.created_at || item.measurement?.created_at);
    const timeKey = granularity === 'day'
      ? date.format('YYYY-MM-DD')
      : date.format('YYYY-MM-DD HH:00');

    if (!grouped[timeKey]) {
      grouped[timeKey] = { time: timeKey };
    }

    const status = item.status || 'UNKNOWN';
    grouped[timeKey][status] = (grouped[timeKey][status] || 0) + 1;
  });

  return Object.values(grouped);
};

const statusColors = {
  'NORMAL': '#0287d0',
  'LOW': '#f4c52b',
  'MEDIUM': '#eb6c02',
  'HIGH': '#d22f2f',
};

const StackedHorizontalChart = ({ actions, granularity = 'hour' }) => {
  const data = prepareData(actions, granularity);
  const statuses = Array.from(
    new Set(actions.map(item => item.status || 'UNKNOWN'))
  ).filter(status => status !== 'time');

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <ResponsiveBar
        data={data}
        keys={statuses}
        indexBy="time"
        margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
        padding={0.3}
        layout="horizontal"
        colors={({ id }) => statusColors[id]}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisBottom={{
          tickRotation: -45,
          legend: 'Liczba alarmów',
          legendPosition: 'middle',
          legendOffset: 80
        }}
        axisLeft={{
          legendPosition: 'middle',
          legendOffset: -40,
          tickRotation: -50
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        enableGridY={true}
        enableLabel={false}
        isInteractive={true}
      />
    </div>
  );
};

export default StackedHorizontalChart;