import { act } from 'react-dom/test-utils';
import moment from 'moment';
import { expandDateUnit, resolveEndpointToMoment, rangeIsValid, resolveRange, unitToMillis, msToReadableElapsedTime, msToReadableDateTime } from './date-utils';
jest.mock('moment', () => {
  return (ms) => {
    return ms !== undefined ? jest.requireActual('moment')(ms) : jest.requireActual('moment')('2020-01-06T00:00:00.000Z');
  };
});

it('expandDateUnit returns the correct expansion', () => {
  let unit;
  act(() => {
    unit = expandDateUnit('s');
  });
  expect(unit).toBe('seconds');

  act(() => {
    unit = expandDateUnit('s', true);
  });
  expect(unit).toBe('second');

  act(() => {
    unit = expandDateUnit('m');
  });
  expect(unit).toBe('minutes');

  act(() => {
    unit = expandDateUnit('m', true);
  });
  expect(unit).toBe('minute');

  act(() => {
    unit = expandDateUnit('h');
  });
  expect(unit).toBe('hours');

  act(() => {
    unit = expandDateUnit('h', true);
  });
  expect(unit).toBe('hour');

  act(() => {
    unit = expandDateUnit('d');
  });
  expect(unit).toBe('days');

  act(() => {
    unit = expandDateUnit('d', true);
  });
  expect(unit).toBe('day');

  act(() => {
    unit = expandDateUnit('w');
  });
  expect(unit).toBe('weeks');

  act(() => {
    unit = expandDateUnit('w', true);
  });
  expect(unit).toBe('week');

  act(() => {
    unit = expandDateUnit('M');
  });
  expect(unit).toBe('months');

  act(() => {
    unit = expandDateUnit('M', true);
  });
  expect(unit).toBe('month');

  act(() => {
    unit = expandDateUnit('y');
  });
  expect(unit).toBe('years');

  act(() => {
    unit = expandDateUnit('y', true);
  });
  expect(unit).toBe('year');
});

it('expandDateUnit returns null for null or incorrect', () => {
  let unit;
  act(() => {
    unit = expandDateUnit(null);
  });
  expect(unit).toBe(null);

  act(() => {
    unit = expandDateUnit('i wandered lonely as a cloud');
  });
  expect(unit).toBe(null);

  act(() => {
    unit = expandDateUnit();
  });
  expect(unit).toBe(null);
});

it('resolveEndpointToMoment resolves now/?', () => {
  let resolved;
  act(() => {
    resolved = resolveEndpointToMoment('now/d', 'from');
  });
  expect(resolved).toStrictEqual(moment().startOf('day'));

  act(() => {
    resolved = resolveEndpointToMoment('now/w', 'from');
  });
  expect(resolved).toStrictEqual(moment().startOf('week'));

  act(() => {
    resolved = resolveEndpointToMoment('now/d', 'to');
  });
  expect(resolved).toStrictEqual(moment().endOf('day'));

  act(() => {
    resolved = resolveEndpointToMoment('now/w', 'to');
  });
  expect(resolved).toStrictEqual(moment().endOf('week'));
});

test('resolveEndpointToMoment should throw an error if no start/end indicator given', () => {
  expect(() => {
    resolveEndpointToMoment('now/w');
  }).toThrow('Incorrect start/end indicator parameter given. Expected "from" or "to" but received: undefined');

  expect(() => {
    resolveEndpointToMoment('now/w', 'something else');
  }).toThrow('Incorrect start/end indicator parameter given. Expected "from" or "to" but received: something else');
});

test('rangeIsValid returns true only if to is after from', () => {
  let isValid;
  act(() => {
    isValid = rangeIsValid({ from: moment(), to: moment().add(1, 'days') });
  });
  expect(isValid).toBe(true);

  act(() => {
    isValid = rangeIsValid({ from: moment().add(3, 'days'), to: moment() });
  });
  expect(isValid).toBe(false);
});

test('resolveEndpointToMoment handles pure now', () => {
  let resolved;
  act(() => {
    resolved = resolveEndpointToMoment('now', 'from');
  });
  expect(resolved).toStrictEqual(moment('2020-01-06T00:00:00.000Z'));

  act(() => {
    resolved = resolveEndpointToMoment('now', 'to');
  });
  expect(resolved).toStrictEqual(moment('2020-01-06T00:00:00.000Z'));
});

test('resolveEndpointToMoment handles relative endpoints', () => {
  let resolved;
  act(() => {
    resolved = resolveEndpointToMoment('now+1h', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-06T01:00:00.000Z');

  act(() => {
    resolved = resolveEndpointToMoment('now-1h', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-05T23:00:00.000Z');

  act(() => {
    resolved = resolveEndpointToMoment('now-5d', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-01T00:00:00.000Z');

  act(() => {
    resolved = resolveEndpointToMoment('now+2d', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-08T00:00:00.000Z');

  act(() => {
    resolved = resolveEndpointToMoment('now+1w', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-13T00:00:00.000Z');

  act(() => {
    resolved = resolveEndpointToMoment('now-1w', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2019-12-30T00:00:00.000Z');
});

test('resolveEndpointToMoment handles dates', () => {
  let resolved;
  act(() => {
    resolved = resolveEndpointToMoment('2020-01-06T01:00:00.000Z', 'from').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-06T01:00:00.000Z');

  act(() => {
    resolved = resolveEndpointToMoment('2020-01-06T01:00:00.000Z', 'to').toISOString();
  });
  expect(resolved).toStrictEqual('2020-01-06T01:00:00.000Z');
});

test('resolveEndpointToMoment handles invalid dates by returning null', () => {
  let resolved;
  act(() => {
    resolved = resolveEndpointToMoment('blah de blah', 'from').toISOString();
  });
  expect(resolved).toBe(null);

  act(() => {
    resolved = resolveEndpointToMoment('bunny vs monkey', 'to').toISOString();
  });
  expect(resolved).toBe(null);

  expect(() => { resolveEndpointToMoment(); })
    .toThrow('Invalid endpoint! Expected a date or date expression but recevied: undefined');
});

test('resolveRange resolves dates correctly', () => {
  let resolved;
  act(() => {
    resolved = resolveRange({ from: 'now', to: '2020-01-06T02:00:00.000Z' });
  });
  expect(resolved.from.toISOString()).toBe('2020-01-06T00:00:00.000Z');
  expect(resolved.to.toISOString()).toBe('2020-01-06T02:00:00.000Z');
  expect(resolved.fromIsNow).toBe(true);
  expect(resolved.toIsNow).toBe(false);

  act(() => {
    resolved = resolveRange({ from: '2020-01-05T00:00:00.000Z', to: 'now' });
  });
  expect(resolved.from.toISOString()).toBe('2020-01-05T00:00:00.000Z');
  expect(resolved.to.toISOString()).toBe('2020-01-06T00:00:00.000Z');
  expect(resolved.fromIsNow).toBe(false);
  expect(resolved.toIsNow).toBe(true);

  act(() => {
    resolved = resolveRange({ from: 'now', to: 'now' });
  });
  expect(resolved.from.toISOString()).toBe('2020-01-06T00:00:00.000Z');
  expect(resolved.to.toISOString()).toBe('2020-01-06T00:00:00.000Z');
  expect(resolved.fromIsNow).toBe(true);
  expect(resolved.toIsNow).toBe(true);

  act(() => {
    resolved = resolveRange({ from: 'now-1h', to: 'now+1h' });
  });
  expect(resolved.from.toISOString()).toBe('2020-01-05T23:00:00.000Z');
  expect(resolved.to.toISOString()).toBe('2020-01-06T01:00:00.000Z');
  expect(resolved.fromIsNow).toBe(false);
  expect(resolved.toIsNow).toBe(false);

  expect(() => { resolveRange({ to: 'now' }); })
    .toThrow('Invalid endpoint! Expected a date or date expression but recevied: undefined');
  expect(() => { resolveRange({ from: 'now' }); })
    .toThrow('Invalid endpoint! Expected a date or date expression but recevied: undefined');
});

test('resolveRange with invalid range does not error', () => {
  // We want to be able to show the user the invalid range, so throwing an error instead of resolving
  // it isn't helpful.
  let resolved;
  act(() => {
    resolved = resolveRange({ from: 'now+5d', to: 'now' });
  });
  expect(resolved.from.toISOString()).toBe('2020-01-11T00:00:00.000Z');
  expect(resolved.to.toISOString()).toBe('2020-01-06T00:00:00.000Z');
  expect(resolved.fromIsNow).toBe(false);
  expect(resolved.toIsNow).toBe(true);
});

test('unitToMillis returns correct millis', () => {
  let millis;
  act(() => {
    millis = unitToMillis(3, 'seconds');
  });
  expect(millis).toBe(3000);

  act(() => {
    millis = unitToMillis(3, 'minutes');
  });
  expect(millis).toBe(180000);

  act(() => {
    millis = unitToMillis(3, 'hours');
  });
  expect(millis).toBe(10800000);

  act(() => {
    millis = unitToMillis(3, 'blah');
  });
  expect(millis).toBe(3);

  act(() => {
    millis = unitToMillis(3);
  });
  expect(millis).toBe(3);
});

test('msToReadableElapsedTime is formatted correctly', () => {
  let formatted;
  act(() => {
    formatted = msToReadableElapsedTime(10800000);
  });
  expect(formatted).toBe('03:00:00');

  act(() => {
    formatted = msToReadableElapsedTime(10890200);
  });
  expect(formatted).toBe('03:01:30');

  act(() => {
    formatted = msToReadableElapsedTime(null);
  });
  expect(formatted).toBe('00:00:00');
});

test('msToReadableDateTime is formatted correctly', () => {
  let formatted;
  act(() => {
    formatted = msToReadableDateTime(1650313955706);
  });
  expect(formatted).toBe('2022-04-18 21:32:35');

  act(() => {
    formatted = msToReadableDateTime(null);
  });
  expect(formatted).toBe('Invalid date');
});
