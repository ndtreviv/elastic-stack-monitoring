import { render, screen, act, waitFor } from '@testing-library/react';
import mockClusterData from '../../sample-responses/clusters.json';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Clusters } from './Clusters';

jest.mock('../utils/api', () => {
  return {
    listClusters: () => Promise.resolve(mockClusterData)
  };
});

it('Clusters renders with clusters', async () => {
  const history = createMemoryHistory();
  history.push('/clusters');
  act(() => {
    render(<Router location={history.location} navigator={history}><Clusters /></Router>);
  });
  await waitFor(() => {
    expect(screen.queryByText('cluster-one')).toBeInTheDocument();
    expect(screen.queryByText('cluster-two')).toBeInTheDocument();
  });
});
