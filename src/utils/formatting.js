export const getColorForStatus = (status) => {
  switch (status) {
    case 'green': return 'success';
    case 'yellow': return 'warning';
    case 'red': return 'error';
    default: return 'info';
  }
};

export const formatBytes = (bytes, decimals = 1, spacer = ' ') => {
  const i = ~~(Math.log2(bytes) / 10);
  return (bytes / Math.pow(1024, i)).toFixed(decimals) + spacer + ('KMGTPEZY'[i - 1] || '') + 'B';
};

export const convertFromBytes = (bytes, decimals = 1) => {
  const i = ~~(Math.log2(bytes) / 10);
  return (bytes / Math.pow(1024, i)).toFixed(decimals);
};

export const formatLargeNumber = (number, compact = false, decimals = 1) => {
  if (!compact) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    const i = ~~(Math.log2(number) / 10);
    return (number / Math.pow(1000, i)).toFixed(decimals) + ' ' + ('kmb'[i - 1] || '');
  }
}
;
