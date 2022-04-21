import moment from 'moment';

export const expandDateUnit = (unit, singular = false) => {
  let expanded = '';
  switch (unit) {
    case 's': expanded = 'second'; break;
    case 'm': expanded = 'minute'; break;
    case 'h': expanded = 'hour'; break;
    case 'd': expanded = 'day'; break;
    case 'w': expanded = 'week'; break;
    case 'M': expanded = 'month'; break;
    case 'y': expanded = 'year'; break;
    default: expanded = null;
  }

  if (expanded !== null && !singular) {
    expanded += 's';
  }
  return expanded;
};

export const resolveEndpointToMoment = (endpoint, end) => {
  if (!endpoint) throw new Error(`Invalid endpoint! Expected a date or date expression but recevied: ${endpoint}`);
  let endpointMoment = moment();
  if (endpoint.startsWith('now/')) {
    const unit = expandDateUnit(endpoint.substring(endpoint.length - 1), true);
    switch (end) {
      case 'from': endpointMoment.startOf(unit); break;
      case 'to': endpointMoment.endOf(unit); break;
      default: throw new Error(`Incorrect start/end indicator parameter given. Expected "from" or "to" but received: ${end}`);
    }
  } else if (endpoint !== 'now') {
    const relativeExpression = endpoint.match(/([-+]{1})([0-9]+)([smhdwMy])/);
    if (relativeExpression) {
      if (relativeExpression[1] === '-') {
        endpointMoment.subtract(parseInt(relativeExpression[2], 10), expandDateUnit(relativeExpression[3]));
      } else {
        endpointMoment.add(parseInt(relativeExpression[2], 10), expandDateUnit(relativeExpression[3]));
      }
    } else {
      endpointMoment = moment(endpoint);
    }
  }
  return endpointMoment;
};

export const rangeIsValid = (range) => {
  return (range.to.isAfter(range.from));
};

export const resolveRange = (range) => {
  const fromIsNow = range.from === 'now';
  const toIsNow = range.to === 'now';
  const from = resolveEndpointToMoment(range.from, 'from');
  const to = resolveEndpointToMoment(range.to, 'to');
  return { from, to, fromIsNow, toIsNow };
};

export const unitToMillis = (period, unit) => {
  switch (unit) {
    case 'seconds':
      return period * 1000;
    case 'minutes':
      return period * 60 * 1000;
    case 'hours':
      return period * 60 * 60 * 1000;
    default: return period;
  }
};

export const msToReadableElapsedTime = (time) => {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;

  let hours = Math.floor(time / hour % 24);
  let minutes = Math.floor(time / minute % 60);
  let seconds = Math.floor(time / second % 60);
  if (minutes < 10) minutes = '0' + minutes;
  if (hours < 10) hours = '0' + hours;
  if (seconds < 10) seconds = '0' + seconds;

  return hours + ':' + minutes + ':' + seconds;
};

export const msToReadableDateTime = (millis) => {
  return moment(millis).format('yyyy-MM-DD HH:mm:ss');
}
;
