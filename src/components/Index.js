import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link as RLink } from 'react-router-dom';
import { getIndexData } from '../utils/api';
import { getColorForStatus, formatBytes, formatLargeNumber } from '../utils/formatting';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/Star';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AnchorTabs from './AnchorTabs';

import { AnchorTabPanel } from './TabPanel';
import MetricChart from './MetricChart';
import { CircularProgress } from '@mui/material';
import rangeContext from '../contexts/rangeContext';

function Indicators ({ data, sx }) {
  console.log('INDICATORS', data);
  return (
    <Paper elevation={2} sx={{ ...sx, mb: 2, padding: 2, display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}><Typography variant='subtitle2' gutterBottom component='div'>Status</Typography></Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Box sx={{ textTransform: 'capitalize', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Badge sx={{ mr: 1 }} color={getColorForStatus(data.indexSummary.status)} overlap='circular' badgeContent=' ' variant='dot' />
              {data.indexSummary.status}
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Total</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatBytes(data.indexSummary.dataSize.total)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Primaries</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatBytes(data.indexSummary.dataSize.primaries)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Documents</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatLargeNumber(data.indexSummary.documents)}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Total Shards</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {data.indexSummary.totalShards}
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack direction='column'>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            <Typography variant='subtitle2' gutterBottom component='div'>Unassigned Shards</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {data.indexSummary.unassignedShards}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

function IndexOverview () {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const { fetchRange } = useContext(rangeContext);

  const { clusterUuid, index } = useParams();

  const fetchData = useCallback(() => {
    setLoading(true);
    getIndexData(clusterUuid, index, fetchRange, false).then(data => {
      setData(data);
      setLoading(false);
    });
    return () => { };
  }, [clusterUuid, fetchRange, index]);

  useEffect(() => {
    if (!data && fetchRange != null) {
      fetchData();
    }
    return () => { };
  }, [data, fetchRange, fetchData]);

  useEffect(() => {
    if (fetchRange != null) {
      fetchData();
    }
    return () => { };
  }, [fetchRange, fetchData]);

  if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>;

  return (
    <>
      <Indicators data={data} />
      {loading && <LinearProgress />}
      {!loading && <Box sx={{ height: '4px' }} />}
      <Paper elevation={2} sx={{ mb: 2 }}>
        <Grid container spacing={2} sx={{ pb: 4 }}>
          {['index_mem', 'index_size', 'index_search_request_rate', 'index_request_rate', 'index_segment_count', 'index_document_count'].map(metric => data.metrics[metric] && (
            <Grid key={metric} item xs={6}>
              <MetricChart sx={{ p: 2, mb: 3, height: 200, width: '90%' }} title={data.metrics[metric][0].metric.title || data.metrics[metric][0].metric.label} series={data.metrics[metric]} />
            </Grid>))}
        </Grid>
      </Paper>
      <IndexShards data={data} />
    </>
  );
}

function IndexAdvanced () {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const { fetchRange } = useContext(rangeContext);

  const { clusterUuid, index } = useParams();

  const fetchData = useCallback(() => {
    setLoading(true);
    getIndexData(clusterUuid, index, fetchRange, true).then(data => {
      setData(data);
      setLoading(false);
    });
  }, [clusterUuid, fetchRange, index]);

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
      <Paper elevation={2} sx={{ mb: 2 }}>
        <Grid container spacing={2} sx={{ pb: 4 }}>
          {['index_1', 'index_2', 'index_3', 'index_4', 'index_disk', 'index_latency', 'index_refresh', 'index_segment_count', 'index_throttling', 'index_time',
            'index_total'].map(metric => data.metrics[metric] && (
              <Grid key={metric} item xs={6}>
                <MetricChart sx={{ p: 2, mb: 3, height: 200, width: '90%' }} title={data.metrics[metric][0].metric.title || data.metrics[metric][0].metric.label} series={data.metrics[metric]} />
              </Grid>))}
        </Grid>
      </Paper>
    </>
  );
}

function IndexShards ({ data }) {
  const { clusterUuid, clusterName, index } = useParams();
  if (!data) return null;

  return (
    <Paper elevation={2} sx={{ mb: 2, p: 1, display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignContent: 'flex-start' }}>
      <Typography variant='h5'>Shards</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 1 }}>
        <Typography>Legend:</Typography>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText'
        }}
        >Primary
        </Box>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'secondary.main',
          color: 'secondary.contrastText'
        }}
        >Replica
        </Box>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'info.main',
          color: 'info.contrastText'
        }}
        >Total
        </Box>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'success.main',
          color: 'success.contrastText'
        }}
        >Started
        </Box>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'grey.400',
          color: 'grey.contrastText'
        }}
        >Initializing
        </Box>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'error.main',
          color: 'error.contrastText'
        }}
        >Unassigned Primary
        </Box>
        <Box sx={{
          borderRadius: 1,
          padding: 1,
          ml: 1,
          fontSize: 12,
          backgroundColor: 'warning.main',
          color: 'warning.contrastText'
        }}
        >Unassigned Replica
        </Box>
      </Box>
      {Object.keys(data.nodes).map(key => (
        <Accordion key={data.nodes[key].name} sx={{ width: '100%' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${key}-content`}
            id={`${key}-header`}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Link
                  component={RLink}
                  to={`/clusters/${clusterUuid}:${clusterName}/nodes/${key}:${data.nodes[key].name}`}
                >{data.nodes[key].name}
                </Link>
                {data.nodes[key].type === 'master' && <StarIcon sx={{ fontSize: 14 }} color='primary' />}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box
                  key={index + '_p'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node === key && shard.primary === true).length}
                </Box>
                <Box
                  key={index + '_r'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node === key && shard.primary === false).length}
                </Box>
                <Box
                  key={index + '_t'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'info.main',
                    color: 'info.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node).length}
                </Box>
                <Box
                  key={index + '_s'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'success.main',
                    color: 'success.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node && shard.state === 'STARTED').length}
                </Box>
                <Box
                  key={index + '_i'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'grey.400',
                    color: 'grey.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node && shard.state === 'INITIALIZING').length}
                </Box>
                <Box
                  key={index + '_up'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'error.main',
                    color: 'error.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node && shard.state === 'UNASSIGNED' && shard.primary === true).length}
                </Box>
                <Box
                  key={index + '_ur'} sx={{
                    borderRadius: 1,
                    padding: 1,
                    ml: 1,
                    fontSize: 12,
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText'
                  }}
                >{data.shards.filter(shard => shard.node && shard.state === 'UNASSIGNED' && shard.primary === false).length}
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              {data.shards.filter(shard => shard.node === key).map((shard, index) => (
                <Tooltip key={index} arrow title={`${shard.state.toLowerCase()}`} placement='top'>
                  <Box sx={{
                    borderRadius: 1,
                    padding: 1,
                    margin: 1,
                    fontSize: 12,
                    cursor: 'pointer',
                    backgroundColor: (shard.primary ? 'primary.main' : 'secondary.main'),
                    color: (shard.primary ? 'primary.contrastText' : 'secondary.contrastText')
                  }}
                  >{shard.shard}
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

    </Paper>
  );
}

export default function Index () {
  const { clusterUuid, clusterName, index } = useParams();

  return (
    <>
      <Box sx={{ padding: 2 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link component={RLink} underline='hover' color='inherit' to='/clusters'>
            clusters
          </Link>
          <Link component={RLink} underline='hover' color='inherit' to={`/clusters/${clusterUuid}:${clusterName}/nodes`}>
            {clusterName}
          </Link>
          <Link component={RLink} underline='hover' color='inherit' to={`/clusters/${clusterUuid}:${clusterName}#indices`}>
            indices
          </Link>
          <Typography color='text.primary'>{index}</Typography>
        </Breadcrumbs>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <AnchorTabs aria-label='Node data'>
          <Tab label='Overview' id='overview' aria-controls='simple-tabpanel-0' />
          <Tab label='Advanced' id='advanced' aria-controls='simple-tabpanel-1' />
        </AnchorTabs>
      </Box>
      <AnchorTabPanel value='overview' index={0}>
        <IndexOverview />
      </AnchorTabPanel>
      <AnchorTabPanel value='advanced' index={1}>
        <IndexAdvanced />
      </AnchorTabPanel>
    </>
  );
}
