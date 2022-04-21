import { act } from 'react-dom/test-utils';
import { getColorForStatus, formatBytes, convertFromBytes, formatLargeNumber } from './formatting';

it('getColourForStatus returns the correct colour', () => {
  let colour;
  act(() => {
    colour = getColorForStatus('green');
  });
  expect(colour).toBe('success');

  act(() => {
    colour = getColorForStatus('yellow');
  });
  expect(colour).toBe('warning');

  act(() => {
    colour = getColorForStatus('red');
  });
  expect(colour).toBe('error');
});

it('formatBytes formats with correct unit', () => {
  let formatted;
  act(() => {
    formatted = formatBytes(986);
  });
  expect(formatted).toBe('986.0 B');

  act(() => {
    formatted = formatBytes(2.097e+6);
  });
  expect(formatted).toBe('2.0 MB');

  act(() => {
    formatted = formatBytes(2047.851563008);
  });
  expect(formatted).toBe('2.0 KB');

  act(() => {
    formatted = formatBytes(2147328000.5326766968);
  });
  expect(formatted).toBe('2.0 GB');

  act(() => {
    formatted = formatBytes(2198863872545.4609375);
  });
  expect(formatted).toBe('2.0 TB');
});

it('formatBytes formats with decimals', () => {
  let formatted;
  act(() => {
    formatted = formatBytes(986, 2);
  });
  expect(formatted).toBe('986.00 B');

  act(() => {
    formatted = formatBytes(2.197e+6, 2);
  });
  expect(formatted).toBe('2.10 MB');

  act(() => {
    formatted = formatBytes(2058, 2);
  });
  expect(formatted).toBe('2.01 KB');

  act(() => {
    formatted = formatBytes(2357338000.5326766968, 2);
  });
  expect(formatted).toBe('2.20 GB');

  act(() => {
    formatted = formatBytes(2698863872545.4609375, 2);
  });
  expect(formatted).toBe('2.45 TB');
});

it('formatBytes formats with correct spacer', () => {
  let formatted;
  act(() => {
    formatted = formatBytes(986, 2, '_');
  });
  expect(formatted).toBe('986.00_B');
});

it('convertFromBytes converts correctly', () => {
  let formatted;
  act(() => {
    formatted = convertFromBytes(986);
  });
  expect(formatted).toBe('986.0');

  act(() => {
    formatted = convertFromBytes(2.097e+6);
  });
  expect(formatted).toBe('2.0');

  act(() => {
    formatted = convertFromBytes(2047.851563008);
  });
  expect(formatted).toBe('2.0');

  act(() => {
    formatted = convertFromBytes(2147328000.5326766968);
  });
  expect(formatted).toBe('2.0');

  act(() => {
    formatted = convertFromBytes(2198863872545.4609375);
  });
  expect(formatted).toBe('2.0');
});

it('convertFromBytes converts with decimals', () => {
  let formatted;
  act(() => {
    formatted = convertFromBytes(986, 2);
  });
  expect(formatted).toBe('986.00');

  act(() => {
    formatted = convertFromBytes(2.197e+6, 2);
  });
  expect(formatted).toBe('2.10');

  act(() => {
    formatted = convertFromBytes(2058, 2);
  });
  expect(formatted).toBe('2.01');

  act(() => {
    formatted = convertFromBytes(2357338000, 2);
  });
  expect(formatted).toBe('2.20');

  act(() => {
    formatted = convertFromBytes(2698863872545, 2);
  });
  expect(formatted).toBe('2.45');
});

it('formatLargeNumber formats correctly', () => {
  let formatted;
  act(() => {
    formatted = formatLargeNumber(1024);
  });
  expect(formatted).toBe('1,024');

  act(() => {
    formatted = formatLargeNumber(10245678);
  });
  expect(formatted).toBe('10,245,678');

  act(() => {
    formatted = formatLargeNumber(10245678.01);
  });
  expect(formatted).toBe('10,245,678.01');
});

it('formatLargeNumber formats compactly', () => {
  let formatted;
  act(() => {
    formatted = formatLargeNumber(1024, true);
  });
  expect(formatted).toBe('1.0 k');

  act(() => {
    formatted = formatLargeNumber(10245678.01, true);
  });
  expect(formatted).toBe('10.2 m');
});

it('formatLargeNumber formats compactly with correct decimals', () => {
  let formatted;
  act(() => {
    formatted = formatLargeNumber(1024, true, 2);
  });
  expect(formatted).toBe('1.02 k');

  act(() => {
    formatted = formatLargeNumber(10245678.01, true, 2);
  });
  expect(formatted).toBe('10.25 m');
});
