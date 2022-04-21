import { createContext } from 'react';
import { resolveRange } from '../utils/date-utils';

const rangeContext = createContext({
  fetchRange: resolveRange({ from: '-1h', to: 'now', label: 'Last 1 hour', type: 'quick-selection' }),
  setFetchRange: (fetchRange) => { }
});

export default rangeContext;
