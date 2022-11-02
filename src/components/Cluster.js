import React, { useEffect, useState, useCallback, useContext } from 'react';
import { listNodes, getClusterOverviewData, listClusterIndices } from '../utils/api';
import { useParams, Link as RLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { formatBytes, formatLargeNumber, getColorForStatus } from '../utils/formatting';
import { msToReadableElapsedTime, msToReadableDateTime } from '../utils/date-utils';
import StarIcon from '@mui/icons-material/Star';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Badge from '@mui/material/Badge';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import AnchorTabs from './AnchorTabs';
import rangeContext from '../contexts/rangeContext';

import {
  DataGrid, GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import { AnchorTabPanel } from './TabPanel';
import MetricChart from './MetricChart';
import Node from './Node';

function Metric ({ data }) {
  const format = (val) => {
    if (data.metric.format === '0.0 b') {
      return formatBytes(val);
    } else if (data.metric.units === '%') {
      return val;
    }
    return val.toFixed(2);
  };

  return (
    <Box sx={{ textAlign: 'right' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {format(data.summary.lastVal)}{data.metric.units}
        {data.summary.slope === -1 && <ArrowDownwardIcon color='success' fontSize='small' sx={{ ml: 1 }} />}
        {data.summary.slope === 1 && <ArrowUpwardIcon color='warning' fontSize='small' sx={{ ml: 1 }} />}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography variant='caption'>{format(data.summary.maxVal)}{data.metric.units} Max</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography variant='caption'>{format(data.summary.minVal)}{data.metric.units} Min</Typography>
      </Box>
    </Box>
  );
}

function ClusterIndicators ({ data }) {
  if (!data) return null;
  return (
    <Paper elevation={2} sx={{ mb: 2, padding: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}><Typography variant='subtitle2' gutterBottom component='div'>Status</Typography></Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.clusterStatus.status === 'green' && <Chip color='success' label={data.clusterStatus.status} />}
            {data.clusterStatus.status === 'yellow' && <Chip color='warning' label={data.clusterStatus.status} />}
            {data.clusterStatus.status === 'red' && <Chip color='error' label={data.clusterStatus.status} />}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Nodes</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.clusterStatus.nodesCount}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Indices</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.clusterStatus.indicesCount}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>JVM Heap</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatBytes(data.clusterStatus.memUsed)} / {formatBytes(data.clusterStatus.memMax)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Total Shards</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.clusterStatus.totalShards}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Unassigned Shards</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.clusterStatus.unassignedShards}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Documents</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatLargeNumber(data.clusterStatus.documentCount)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Data</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatBytes(data.clusterStatus.dataSize)}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

function ShardActivity ({ data }) {
  const { clusterUuid, clusterName } = useParams();
  const [showCompletedRecoveries, setShowCompletedRecoveries] = useState(false);
  const dataToShow = (showCompletedRecoveries ? data : data.filter(activity => activity.stage !== 'DONE'));

  return (
    <>
      <FormGroup sx={{ m: 1 }}>
        <FormControlLabel control={<Switch value={showCompletedRecoveries} inputProps={{ 'aria-label': 'controlled' }} onChange={e => { setShowCompletedRecoveries(e.target.checked); }} />} label='Show Completed Recoveries' />
      </FormGroup>
      <TableContainer elevation={2} component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Index</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Total Time</TableCell>
              <TableCell>Source / Destination</TableCell>
              <TableCell>Files</TableCell>
              <TableCell>Bytes</TableCell>
              <TableCell>Translog</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataToShow.map((activity, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell xs={{ display: 'flex', flexDirection: 'column' }}>
                  <Box><Link component={RLink} to={`/clusters/${clusterUuid}:${clusterName}/indices/${activity.index_name}`}>{activity.index_name}</Link></Box>
                  <Box>Shard: {activity.id} / {activity.primary ? 'Primary' : 'Replica'}</Box>
                  <Box>Recovery Type: {activity.type.toLowerCase().replace(/_/g, ' ')}</Box>
                  {activity.type === 'SNAPSHOT' && (
                    <>
                      <Box>Repo: {activity.source.repository}</Box>
                      <Box>Snapshot: {activity.source.snapshot}</Box>
                    </>)}
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {activity.stage.toLowerCase()}
                </TableCell>
                <TableCell>
                  <Tooltip title={`${msToReadableDateTime(activity.start_time_in_millis)} - ${msToReadableDateTime(activity.stop_time_in_millis)}`} placement='top'>
                    <Box sx={{ color: 'primary.main', cursor: 'pointer' }}>{msToReadableElapsedTime(activity.total_time_in_millis)}</Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {(!activity.source || !activity.source.name) && 'N/A'}
                    {(activity.source && activity.source.name) &&
                      <Tooltip title={activity.source.transport_address} placement='top'>
                        <Box sx={{ color: 'primary.main', cursor: 'pointer' }}>{activity.source.name}</Box>
                      </Tooltip>}
                    <ArrowRightAltIcon />
                    {(activity.target && activity.target.name) &&
                      <Tooltip title={activity.target.transport_address} placement='top'>
                        <Box sx={{ color: 'primary.main', cursor: 'pointer' }}>{activity.target.name}</Box>
                      </Tooltip>}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box>{activity.index.files.percent}</Box>
                    <Box>{activity.index.files.recovered} / {activity.index.files.total}</Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box>{activity.index.size.percent}</Box>
                    <Box>{formatBytes(activity.index.size.recovered_in_bytes)} / {formatBytes(activity.index.size.total_in_bytes)}</Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box>{activity.translog.percent}</Box>
                    <Box>{activity.translog.recovered} / {activity.translog.total}</Box>
                    <Box>{msToReadableElapsedTime(activity.translog.total_time_in_millis)}</Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {dataToShow.length === 0 && <Box sx={{ m: 1, textAlign: 'center' }}>There are no active shard recoveries for this cluster.<br />Try viewing completed recoveries.</Box>}
      </TableContainer>

    </>
  );
}

function ClusterOverview () {
  const { fetchRange } = useContext(rangeContext);
  const { clusterUuid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    getClusterOverviewData(clusterUuid, fetchRange).then(data => {
      setData(data);
      console.log('OVERVIEW_DATA', data);
      setLoading(false);
    });
  }, [clusterUuid, fetchRange]);

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

  return (
    <Box>
      {!data && loading && <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>}
      {data && (
        <>
          <ClusterIndicators data={data} />
          <Paper elevation={2} sx={{ mb: 2 }}>
            <Grid container sx={{ pb: 4 }} spacing={2}>
              {['cluster_search_request_rate', 'cluster_query_latency', 'cluster_index_request_rate', 'cluster_index_latency'].map(metric => data.metrics[metric] && (
                <Grid key={metric} item xs={6}>
                  <MetricChart sx={{ p: 2, mb: 3, height: 200, width: '90%' }} title={data.metrics[metric][0].metric.title || data.metrics[metric][0].metric.label} series={data.metrics[metric]} />
                </Grid>))}
            </Grid>
          </Paper>
          <Paper elevation={2}>
            <ShardActivity data={data.shardActivity} />
          </Paper>
        </>
      )}
    </Box>
  );
}

function NodeList () {
  const { clusterUuid, clusterName } = useParams();
  const { fetchRange } = useContext(rangeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    listNodes(clusterUuid, fetchRange).then(data => {
      setData(data);
      console.log('DATA', data);
      setLoading(false);
    });
  }, [clusterUuid, fetchRange]);

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

  return (
    <Box>
      {!data && loading && <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>}
      {data && (
        <>
          {loading && <LinearProgress />}
          {!loading && <Box sx={{ height: '4px' }} />}
          <ClusterIndicators data={data} />
          <TableContainer elevation={2} component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align='center'>Status</TableCell>
                  <TableCell align='center'>Shards</TableCell>
                  <TableCell>CPU Usage</TableCell>
                  <TableCell>Load Average</TableCell>
                  <TableCell>JVM Heap</TableCell>
                  <TableCell>Disk Free Space</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.nodes.map((node) => (
                  <TableRow
                    key={node.uuid}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component='th' scope='row'>
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <RLink to={`/clusters/${clusterUuid}:${clusterName}/nodes/${node.uuid}:${node.name}`}>{node.name}</RLink>
                        {node.type === 'master' && <StarIcon sx={{ fontSize: 14 }} color='primary' />}
                      </Box>
                      <Box><Typography variant='overline'>{node.transport_address}</Typography></Box>
                    </TableCell>
                    <TableCell align='center'>
                      {node.isOnline === true && <Chip color='success' label='Online' />}
                      {node.isOnline !== true && <Chip label='Offline' />}
                    </TableCell>
                    <TableCell align='center'>
                      {node.shardCount}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Metric data={node.node_cpu_utilization} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Metric data={node.node_load_average} />
                    </TableCell>
                    <TableCell align='right'>
                      <Metric data={node.node_jvm_mem_percent} />
                    </TableCell>
                    <TableCell align='right'>
                      <Metric data={node.node_free_space} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

function IndexList () {
  const { fetchRange } = useContext(rangeContext);
  const { clusterUuid, clusterName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [includeSystemIndices, setIncludeSystemIndices] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    listClusterIndices(clusterUuid, fetchRange, includeSystemIndices).then(data => {
      setData(data);
      console.log('DATA', data);
      setLoading(false);
    });
  }, [clusterUuid, fetchRange, includeSystemIndices]);

  useEffect(() => {
    if (!data && fetchRange != null) {
      fetchData();
    }
  }, [data, fetchRange, fetchData]);

  useEffect(() => {
    if (fetchRange != null) {
      fetchData();
    }
  }, [fetchRange, includeSystemIndices, fetchData]);

  function GridToolbarSwitch () {
    return (
      <FormControlLabel
        sx={{ ml: 1 }}
        control={<Switch
          size='small'
          checked={includeSystemIndices}
          onChange={(e) => { setIncludeSystemIndices(e.target.checked); }}
          inputProps={{ 'aria-label': 'controlled' }}
                 />}
        label={<Typography color='primary' variant='button'>Include System Indices</Typography>}
      />
    );
  }

  function CustomToolbar () {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <GridToolbarSwitch />
      </GridToolbarContainer>
    );
  }

  const COLUMNS = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Link component={RLink} to={`/clusters/${clusterUuid}:${clusterName}/indices/${params.value}`}>
          {params.value}
        </Link>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <Box sx={{ textTransform: 'capitalize', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Badge sx={{ mr: 1 }} color={getColorForStatus(params.value)} overlap='circular' badgeContent=' ' variant='dot' />
          {params.value}
        </Box>
      )
    },
    {
      field: 'doc_count',
      headerName: 'Document Count',
      width: 150,
      valueFormatter: (params) => {
        return formatLargeNumber(params.value, true);
      }
    },
    {
      field: 'data_size',
      headerName: 'Data',
      valueFormatter: (params) => {
        return formatBytes(params.value);
      }
    },
    {
      field: 'index_rate',
      headerName: 'Index Rate',
      valueFormatter: (params) => {
        return parseFloat(params.value).toFixed(1) + ' /s';
      }
    },
    {
      field: 'search_rate',
      headerName: 'Search Rate',
      valueFormatter: (params) => {
        return parseFloat(params.value).toFixed(1) + ' /s';
      }
    },
    {
      field: 'unassigned_shards',
      headerName: 'Unassigned Shards',
      valueFormatter: (params) => {
        return formatLargeNumber(params.value);
      },
      cellClassName: (params) => params.value > 0 ? 'has_unassigned_shards' : '',
      width: 200
    }
  ];

  return (
    <Box>
      {!data && loading && <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>}
      {data && (
        <>
          {loading && <LinearProgress />}
          {!loading && <Box sx={{ height: '4px' }} />}
          <ClusterIndicators data={data} />
          <DataGrid
            sx={{
              minHeight: 500,
              '& .MuiDataGrid-cell.has_unassigned_shards': {
                backgroundColor: 'error.main',
                color: 'error.contrastText'
              }
            }}
            getRowId={(row) => row.name}
            rows={data.indices}
            columns={COLUMNS}
            components={{ Toolbar: CustomToolbar }}
          />
        </>
      )}
    </Box>
  );
}

export function Cluster () {
  const { clusterName, nodeUuid } = useParams();

  if (nodeUuid) {
    return <Node />;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }} aria-label='breadcrumb'>
        <Link underline='hover' color='inherit' to='/clusters' component={RLink}>
          clusters
        </Link>
        <Typography color='text.primary'>{clusterName}</Typography>
      </Breadcrumbs>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <AnchorTabs aria-label='Cluster data'>
          <Tab label='Overview' id='overview' aria-controls='simple-tabpanel-0' />
          <Tab label='Nodes' id='nodes' aria-controls='simple-tabpanel-1' />
          <Tab label='Indices' id='indices' aria-controls='simple-tabpanel-2' />
        </AnchorTabs>
      </Box>
      <AnchorTabPanel value='overview' index={0}>
        <ClusterOverview />
      </AnchorTabPanel>
      <AnchorTabPanel value='nodes' index={1}>
        <NodeList />
      </AnchorTabPanel>
      <AnchorTabPanel value='indices' index={2}>
        <IndexList />
      </AnchorTabPanel>
    </Box>
  );
}
