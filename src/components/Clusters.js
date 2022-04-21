import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClusters } from '../utils/api';
import { getColorForStatus } from '../utils/formatting';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircularProgress from '@mui/material/CircularProgress';
import rangeContext from '../contexts/rangeContext';

export function Clusters () {
  const { fetchRange } = useContext(rangeContext);

  const [clusters, setClusters] = useState(null);
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    setLoading(true);
    listClusters(fetchRange).then(clusterData => {
      setClusters(clusterData);
      setLoading(false);
    });
  }, [fetchRange]);

  useEffect(() => {
    if (!clusters && fetchRange != null) {
      fetchData();
    }
  }, [clusters, fetchRange, fetchData]);

  return (
    <Box sx={{ padding: 2 }}>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', m: 2 }}><CircularProgress /></Box>}
      {clusters &&
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>Version</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>License</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>Nodes</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>Total Indices</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>Total Shards</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clusters.map((row) => (
                <TableRow
                  onClick={() => { navigate(`/clusters/${row.cluster_uuid}:${row.cluster_name}`); }}
                  key={row.cluster_uuid}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                >
                  <TableCell component='th' scope='row'>{row.cluster_name}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{row.version}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {row.license.status === 'active' && <Chip color='success' icon={<CheckCircleOutlineIcon />} label={row.license.type} />}
                    {row.license.status !== 'active' && <Chip icon={<RadioButtonUncheckedIcon />} label={row.license.type} />}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ textTransform: 'capitalize', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Badge sx={{ mr: 1 }} color={getColorForStatus(row.status)} overlap='circular' badgeContent=' ' variant='dot' />
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{row.elasticsearch.cluster_stats.nodes.count.total}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{row.elasticsearch.cluster_stats.indices.count}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{row.elasticsearch.cluster_stats.indices.shards.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>}
    </Box>
  );
}
