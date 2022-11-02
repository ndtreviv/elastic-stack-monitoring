import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link as RLink } from 'react-router-dom';
import { getNodeData } from '../utils/api';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import { LinearProgress, CircularProgress } from '@mui/material';
import { AnchorTabPanel } from './TabPanel';
import AnchorTabs from './AnchorTabs';
import {
  DataGrid, GridToolbar
} from '@mui/x-data-grid';
import { formatBytes, formatLargeNumber } from '../utils/formatting';
import MetricChart from './MetricChart';
import rangeContext from '../contexts/rangeContext';

function Indicators ({ data, sx }) {
  return (
    <Paper elevation={2} sx={{ ...sx, mb: 2, padding: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}><Typography variant='subtitle2' gutterBottom component='div'>Status</Typography></Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.nodeSummary.isOnline && <Chip color='success' label='Online' />}
            {!data.nodeSummary.isOnline && <Chip color='error' label='Offline' />}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Transport Address</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.nodeSummary.transport_address}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>JVM Heap</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.nodeSummary.usedHeap}%
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Free Disk Space</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatBytes(data.nodeSummary.freeSpace)} ({(data.nodeSummary.freeSpace / data.nodeSummary.totalSpace * 100).toFixed(2)}%)
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Documents</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatLargeNumber(data.nodeSummary.documents)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Data</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatBytes(data.nodeSummary.dataSize)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Indices</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.nodeSummary.indexCount}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Shards</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.nodeSummary.totalShards}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Type</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {data.nodeSummary.type}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

function ShardTable ({ data }) {
  const { clusterUuid, clusterName } = useParams();
  const COLUMNS = [
    {
      field: 'index',
      headerName: 'Index',
      flex: 1,
      renderCell: (params) => (
        <Link component={RLink} to={`/clusters/${clusterUuid}:${clusterName}/indices/${params.value}`}>
          {params.value}
        </Link>
      )
    },
    {
      field: 'shard',
      headerName: 'Shard #'
    },
    {
      field: 'primary',
      headerName: 'Primary/Replica',
      width: 150,
      valueFormatter: (params) => {
        return params.value ? 'Primary' : 'Replica';
      },
      type: 'singleSelect',
      valueOptions: ['PRIMARY', 'REPLICA'],
      cellClassName: (params) => 'shard_type-' + (params.value === true ? 'primary' : 'replica')
    },
    {
      field: 'state',
      headerName: 'State',
      type: 'singleSelect',
      valueOptions: ['STARTED', 'INITIALIZING', 'RELOCATING', 'UNASSIGNED'],
      cellClassName: (params) => 'shard_state-' + params.value.toLowerCase(),
      valueFormatter: (params) => {
        return params.value.toLowerCase();
      }
    }
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        sx={{
          '& .MuiDataGrid-row.has_data': {
            cursor: 'pointer'
          },
          '& .MuiDataGrid-row.no_data:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0)'
          },
          '& .MuiDataGrid-cell.shard_state-started': {
            color: 'success.main',
            textTransform: 'capitalize'
          },
          '& .MuiDataGrid-cell.shard_state-initializing': {
            color: 'secondary.main',
            textTransform: 'capitalize'
          },
          '& .MuiDataGrid-cell.shard_state-relocating': {
            color: 'info.main',
            textTransform: 'capitalize'
          },
          '& .MuiDataGrid-cell.shard_state-unassigned': {
            color: 'error.main',
            textTransform: 'capitalize'
          },
          '& .MuiDataGrid-cell.shard_type-primary': {
            color: 'primary.main'
          },
          '& .MuiDataGrid-cell.shard_type-replica': {
            color: 'secondary.main'
          }
        }}
        rows={data}
        columns={COLUMNS}
        pageSize={5}
        rowsPerPageOptions={[5]}
        components={{ Toolbar: GridToolbar }}
      />
    </Box>
  );
}

function NodeOverview () {
  const { fetchRange } = useContext(rangeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);

  const { clusterUuid, nodeUuid } = useParams();

  const fetchData = useCallback(() => {
    setLoading(true);
    getNodeData(clusterUuid, nodeUuid, fetchRange, false).then(data => {
      setData(data);
      setLoading(false);
    });
  }, [clusterUuid, nodeUuid, fetchRange]);

  useEffect(() => {
    if (!data && fetchRange != null) {
      fetchData();
    }
  }, [data, fetchRange, fetchData]);

  useEffect(() => {
    if (fetchRange != null) {
      fetchData();
    }
  }, [fetchRange, fetchData]);

  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>;

  return (
    <>
      <Indicators data={data} />
      {loading && <LinearProgress />}
      {!loading && <Box sx={{ height: '4px' }} />}
      <Paper elevation={2} sx={{ mb: 2, mt: 2 }}>
        <Grid container spacing={2} sx={{ pb: 4 }}>
          {['node_jvm_mem', 'node_mem', 'node_total_io', /* 'node_cpu_metric', */'node_load_average', 'node_latency', 'node_segment_count'].map(metric => data.metrics[metric] && (
            <Grid key={metric} item xs={6}>
              <MetricChart sx={{ p: 2, mb: 3, height: 200, width: '90%' }} title={data.metrics[metric][0].metric.title || data.metrics[metric][0].metric.label} series={data.metrics[metric]} />
            </Grid>))}
        </Grid>
      </Paper>
    </>
  );
}

function NodeAdvanced () {
  const { fetchRange } = useContext(rangeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);

  const { clusterUuid, nodeUuid } = useParams();

  const fetchData = useCallback(() => {
    setLoading(true);
    getNodeData(clusterUuid, nodeUuid, fetchRange, true).then(data => {
      setData(data);
      setLoading(false);
    });
  }, [clusterUuid, nodeUuid, fetchRange]);

  useEffect(() => {
    if (!data && fetchRange != null) {
      fetchData();
    }
  }, [data, fetchRange, fetchData]);

  useEffect(() => {
    if (fetchRange != null) {
      fetchData();
    }
  }, [fetchRange, fetchData]);

  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>;

  return (
    <>
      <Indicators data={data} />
      {loading && <LinearProgress />}
      {!loading && <Box sx={{ height: '4px' }} />}
      <Paper elevation={2} sx={{ mb: 2, mt: 2 }}>
        <Grid container spacing={2} sx={{ pb: 4 }}>
          {['node_gc', 'node_gc_time', 'node_jvm_mem', 'node_cpu_utilization', 'node_index_1', 'node_index_2', 'node_index_3', 'node_index_4', 'node_index_time', 'node_request_total',
            'node_index_threads', 'node_read_threads', 'node_latency'].map(metric => data.metrics[metric] && (
              <Grid key={metric} item xs={6}>
                <MetricChart sx={{ p: 2, mb: 3, height: 200, width: '90%' }} title={data.metrics[metric][0].metric.title || data.metrics[metric][0].metric.label} series={data.metrics[metric]} />
              </Grid>))}
        </Grid>
      </Paper>
    </>
  );
}

function NodeShards () {
  const { fetchRange } = useContext(rangeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);

  const { clusterUuid, nodeUuid } = useParams();

  const fetchData = useCallback(() => {
    setLoading(true);
    getNodeData(clusterUuid, nodeUuid, fetchRange, false).then(data => {
      setData(data);
      setLoading(false);
    });
  }, [clusterUuid, nodeUuid, fetchRange]);

  useEffect(() => {
    if (!data && fetchRange != null) {
      fetchData();
    }
  }, [data, fetchRange, fetchData]);

  useEffect(() => {
    if (fetchRange != null) {
      fetchData();
    }
  }, [fetchRange, fetchData]);

  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>;

  return (
    <>
      {loading && <LinearProgress />}
      {!loading && <Box sx={{ height: '4px' }} />}
      <ShardTable data={data.shards.map(shard => {
        return { ...shard, id: shard.index + '_' + shard.shard };
      })}
      />
    </>
  );
}

export default function Node () {
  const { clusterUuid, clusterName, nodeName } = useParams();

  return (
    <>
      <Box sx={{ padding: 2 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link component={RLink} underline='hover' color='inherit' to='/clusters'>
            clusters
          </Link>
          <Link component={RLink} underline='hover' color='inherit' to={`/clusters/${clusterUuid}:${clusterName}`}>
            {clusterName}
          </Link>
          <Typography color='text.primary'>{nodeName}</Typography>
        </Breadcrumbs>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <AnchorTabs aria-label='Node data'>
          <Tab label='Overview' id='overview' aria-controls='simple-tabpanel-0' />
          <Tab label='Advanced' id='advanced' aria-controls='simple-tabpanel-1' />
          <Tab label='Shards' id='shards' aria-controls='simple-tabpanel-2' />
        </AnchorTabs>
      </Box>
      <AnchorTabPanel value='overview' index={0}>
        <NodeOverview />
      </AnchorTabPanel>
      <AnchorTabPanel value='advanced' index={1}>
        <NodeAdvanced />
      </AnchorTabPanel>
      <AnchorTabPanel value='shards' index={2}>
        <NodeShards />
      </AnchorTabPanel>
    </>
  );
}
