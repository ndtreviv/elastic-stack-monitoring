import React from 'react';
import { render, screen } from '@testing-library/react';
import rangeContext from './rangeContext';
import { resolveRange } from '../utils/date-utils';
jest.mock('moment', () => {
  return (ms) => {
    return ms !== undefined ? jest.requireActual('moment')(ms) : jest.requireActual('moment')('2020-01-06T00:00:00.000Z');
  };
});

it('rangeContext provides fetch range', () => {
  const fetchRange = resolveRange({ from: '-1h', to: 'now', label: 'Last 1 hour', type: 'quick-selection' });
  const wrapper = ({ children }) => (
    <rangeContext.Provider value={{ fetchRange, setFetchRange: () => {} }}>
      {children}
    </rangeContext.Provider>
  );

  render(<rangeContext.Consumer>{({ fetchRange }) => JSON.stringify(fetchRange)}</rangeContext.Consumer>, { wrapper });
  expect(screen.getByText(/^{"from":/).textContent).toBe(
    '{"from":"2020-01-05T23:00:00.000Z","to":"2020-01-06T00:00:00.000Z","fromIsNow":false,"toIsNow":true}'
  );
});

it('rangeContext updates when setFetchRange is called', () => {
  let fetchRange1 = resolveRange({ from: '-1h', to: 'now', label: 'Last 1 hour', type: 'quick-selection' });
  const fetchRange2 = resolveRange({ from: '-1m', to: 'now', label: 'Last 1 minute', type: 'quick-selection' });
  const setFetchRange = (newFetchRange) => { fetchRange1 = newFetchRange; };
  const wrapper = ({ children }) => (
    <rangeContext.Provider value={{ fetchRange: fetchRange1, setFetchRange }}>
      {children}
    </rangeContext.Provider>
  );

  render(
    <rangeContext.Consumer>{({ fetchRange, setFetchRange }) => {
      setFetchRange(fetchRange2);
      return <div data-testid='first'>{JSON.stringify(fetchRange)}</div>;
    }}
    </rangeContext.Consumer>, { wrapper });
  render(
    <rangeContext.Consumer>{({ fetchRange }) => {
      return <div data-testid='second'>{JSON.stringify(fetchRange)}</div>;
    }}
    </rangeContext.Consumer>, { wrapper });
  expect(screen.getByTestId('second').textContent).toBe(
    '{"from":"2020-01-05T23:59:00.000Z","to":"2020-01-06T00:00:00.000Z","fromIsNow":false,"toIsNow":true}'
  );
});
