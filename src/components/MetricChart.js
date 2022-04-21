import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { formatBytes, formatLargeNumber } from '../utils/formatting';
import { Chart } from 'react-charts';

export default function MetricChart ({ title, series, sx }) {
  const data = series.map(d => {
    return {
      label: d.metric.label,
      data: d.data
    };
  });

  const primaryAxis = React.useMemo(function () {
    return ({
      // format: (data) => { console.log("TICKFORMAT", data); return data; },
      formatters: {
        tooltip: (val) => { return moment(val).format('yyyy-MM-DD HH:mm'); }
      },
      getValue: function (datum) { return new Date(datum[0]); }
    });
  }, []);

  const secondaryAxes = React.useMemo(function () {
    const yAxisType = series[0].metric.units;
    const formatVal = (val) => {
      if (!val) return val;
      switch (yAxisType) {
        case 'B': return formatBytes(val);
        case 'ms': return parseFloat(val).toFixed(2) + 'ms';
        case '/s': return parseFloat(val).toFixed(2) + '/s';
        case '%': return val + '%';
        default: return formatLargeNumber(val, false, 2);
      }
    };

    return [
      {
        format: formatVal,
        formatters: {
          tooltip: formatVal
        },
        showGrid: false,
        getValue: function (datum) { return datum[1]; /* convertFromBytes(datum[1]); */ }
      }
    ];
  }, [series]);

  return (
    <Box sx={sx}>
      <Typography variant='h5'>{title}{series[0].metric.units && ` (${series[0].metric.units})`}</Typography>
      <Chart
        options={{
          data,
          primaryAxis,
          secondaryAxes
        }}
      />
    </Box>
  );
}
