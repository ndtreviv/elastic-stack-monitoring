import React, { useState, useContext } from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import StopOutlinedIcon from '@mui/icons-material/StopOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import { TabPanel } from './TabPanel';
import moment from 'moment';
import rangeContext from '../contexts/rangeContext';

import { rangeIsValid, resolveRange, unitToMillis } from '../utils/date-utils';

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
const REFRESH_UNITS = ['seconds', 'minutes', 'hours'];
const QUICK_SELECT_COMMON = [
  {
    label: 'Today',
    from: 'now/d',
    to: 'now/d',
    expression: 'now/d'
  },
  {
    label: 'This week',
    from: 'now/w',
    to: 'now/w',
    expression: 'now/w'
  },
  {
    label: 'Last 15 minutes',
    from: '-15m',
    to: 'now',
    expression: 'now-15m'
  },
  {
    label: 'Last 30 minutes',
    from: '-30m',
    to: 'now',
    expression: 'now-30m'
  },
  {
    label: 'Last hour',
    from: '-1h',
    to: 'now',
    expression: 'now-1h'
  },
  {
    label: 'Last 24 hours',
    from: '-24h',
    to: 'now',
    expression: 'now-24h'
  },
  {
    label: 'Last 7 days',
    from: '-7d',
    to: 'now',
    expression: 'now-7d'
  },
  {
    label: 'Last 30 days',
    from: '-30d',
    to: 'now',
    expression: 'now-30d'
  },
  {
    label: 'Last 90 days',
    from: '-90d',
    to: 'now',
    expression: 'now-90d'
  },
  {
    label: 'Last year',
    from: '-1y',
    to: 'now',
    expression: 'now-1y'
  }
];

function Calendar ({ onSelectDate, initialDate }) {
  const [refDate, setRefDate] = useState(initialDate);

  const doSetRefDate = (refDate) => {
    setRefDate(refDate.toISOString());
    onSelectDate(refDate.toISOString());
  };

  const getTimes = () => {
    const startTime = moment().startOf('day');
    const endTime = moment().endOf('day');
    const allTimes = [];

    while (startTime < endTime) {
      allTimes.push(startTime.format('HH:mm'));
      startTime.add(30, 'minutes');
    }
    return allTimes;
  };

  const refDateMoment = moment(refDate);
  const month = refDateMoment.month();
  const nextMonth = moment(refDateMoment).add(1, 'months').month();
  const year = refDateMoment.year();
  let incDate = moment(refDateMoment).startOf('month').startOf('week').hour(refDateMoment.hour()).minutes(refDateMoment.minutes()).seconds(refDateMoment.seconds()).milliseconds(refDateMoment.milliseconds());
  const weeks = [];

  while (true) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        date: incDate.toDate().getDate(),
        fullDate: moment(incDate),
        inMonth: incDate.month() === refDateMoment.month()
      });
      incDate = incDate.add(1, 'day');
    }
    weeks.push(week);
    if (incDate.month() === nextMonth) {
      break;
    }
  }

  return (
    <Box sx={{ maxHeight: 310 }}>
      <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <IconButton aria-label='previous month' onClick={() => { doSetRefDate(refDateMoment.month(month - 1)); }}>
          <ArrowBackIcon />
        </IconButton>
        <Select sx={{ ml: 1, flexGrow: 2 }} value={month} size='small' onChange={e => { doSetRefDate(refDateMoment.month(e.target.value)); }}>
          {Array(12).fill(0).map((x, y) => x + y).map(m => (<MenuItem key={m} value={m} dense>{moment().month(m).format('MMMM')}</MenuItem>))}
        </Select>
        <Select sx={{ ml: 1, flexGrow: 2 }} value={year} size='small' onChange={e => { doSetRefDate(refDateMoment.year(e.target.value)); }}>
          {Array(15).fill(year - 7).map((x, y) => x + y).map(y => (<MenuItem key={y} value={y} dense>{moment().year(y).format('YYYY')}</MenuItem>))}
        </Select>

        <IconButton sx={{ ml: 1 }} aria-label='next month' onClick={() => { doSetRefDate(refDateMoment.month(month + 1)); }}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ flexGrow: 2 }}>
          <Box sx={{ fontWeight: 800, fontSize: 12, textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ width: 20 }}>Su</Box>
            <Box sx={{ width: 20 }}>Mo</Box>
            <Box sx={{ width: 20 }}>Tu</Box>
            <Box sx={{ width: 20 }}>We</Box>
            <Box sx={{ width: 20 }}>Th</Box>
            <Box sx={{ width: 20 }}>Fr</Box>
            <Box sx={{ width: 20 }}>Sa</Box>
          </Box>
          <Box>
            {weeks.map((week, i) => (
              <Box
                key={'week_' + i} sx={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '& div:hover': {
                    color: 'primary.main',
                    fontWeight: 800,
                    textDecoration: 'underline'
                  }
                }}
              >
                {week.map((day, d) => (
                  <Box
                    key={d}
                    onClick={e => { doSetRefDate(day.fullDate); }}
                    sx={{
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                      width: 20,
                      pb: 1,
                      pt: 1,
                      textAlign: 'center',
                      ...(!day.inMonth ? { color: 'rgba(0, 0, 0, 0.5)' } : {}),
                      ...(refDateMoment.format('MM:DD') === day.fullDate.format('MM:DD') ? { backgroundColor: 'primary.main', color: 'white', borderRadius: 2 } : {})
                    }}
                  >{day.date}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{
          p: 1,
          pl: 2,
          pr: 2,
          mb: 1,
          backgroundColor: '#fbfcfd',
          ml: 1,
          maxHeight: 190,
          overflow: 'auto',
          '& div:hover': {
            color: 'primary.main',
            textDecoration: 'underline'
          }
        }}
        >{getTimes().map(time => (
          <Box
            onClick={e => { doSetRefDate(refDateMoment.hours(time.split(':')[0]).minutes(time.split(':')[1]).seconds(0).milliseconds(0)); }}
            sx={{ textAlign: 'center', p: 0.5, fontSize: 12, fontWeight: 500, cursor: 'pointer', ...(refDateMoment.format('HH:mm') === time ? { backgroundColor: 'primary.main', color: 'white', borderRadius: 2 } : {}) }}
            key={time}
          >
            {time}
          </Box>
        ))}
        </Box>
      </Box>
    </Box>
  );
}

function FieldSelect ({ open, anchorEl, onClose, anchorOrigin, transformPopoverOrigin, field, setField }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [relativePeriod, setRelativePeriod] = useState(0);
  const [relativeUnits, setRelativeUnits] = useState('-seconds');
  const [roundToTheMinute, setRoundToTheMinute] = useState(false);
  const [absoluteDate, setAbsoluteDate] = useState(moment().toISOString());

  const doSetAbsoluteDate = (value) => {
    setAbsoluteDate(value);
    setField(value, field, 'absolute');
  };

  const getRelativeFrom = () => {
    const relativeFrom = moment();
    const relativeDiff = relativeUnits.substring(0, 1);
    if (relativeDiff === '-') {
      relativeFrom.subtract(relativePeriod, relativeUnits.substring(1));
    } else {
      relativeFrom.add(relativePeriod, relativeUnits.substring(1));
    }
    if (roundToTheMinute) {
      relativeFrom.startOf('minute');
    }
    return relativeFrom;
  };

  const doSetRelativeDate = ({ period, units, roundToTheMinute }) => {
    if (period) {
      setRelativePeriod(period);
    }
    if (units) {
      setRelativeUnits(units);
    }
    if (roundToTheMinute) {
      setRoundToTheMinute(roundToTheMinute);
    }
    setField(getRelativeFrom().toISOString(), field, 'relative');
  };

  const doSetDateAsNow = () => {
    setField('now', field, 'relative');
  };

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`
    };
  };

  const relativeFrom = getRelativeFrom();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      tansformOrigin={transformPopoverOrigin}
      sx={{ p: 1, minWidth: 400 }}
    >
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => { setSelectedTab(newValue); }} aria-label='Select date and time'>
            <Tab label='Absolute' {...a11yProps(0)} />
            <Tab label='Relative' {...a11yProps(1)} />
            <Tab label='Now' {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value='absolute' index={0} selected={selectedTab === 0} sx={{ width: 370 }}>
          <Calendar onSelectDate={doSetAbsoluteDate} initialDate={absoluteDate} />
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', border: 'solid 1px', borderRadius: 1, borderColor: 'rgba(0, 0, 0, 0.27)' }}>
            <Box sx={{ fontWeight: 'bold', fontSize: 12, width: 'auto', borderRight: 'solid 1px rgba(0, 0, 0, 0.27)', backgroundColor: '#ededed', p: 1 }}>{field === 'from' ? 'Start' : 'End'} date</Box>
            <Box sx={{ ml: 1, overflow: 'hidden' }}>{moment(absoluteDate).format('MMM Do, YYYY @ HH:mm:ss.SSS')}</Box>
          </Box>
        </TabPanel>
        <TabPanel value='relative' index={1} selected={selectedTab === 1}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <TextField
              size='small'
              onChange={e => { doSetRelativeDate({ period: e.target.value }); }}
              type='number'
              value={relativePeriod}
            />
            <Select sx={{ ml: 1 }} value={relativeUnits} size='small' onChange={e => { doSetRelativeDate({ units: e.target.value }); }}>
              {UNITS.map(unit => (<MenuItem key={'-' + unit} value={'-' + unit} dense>{unit.replace(/\b([a-z])/, unit.substring(0, 1).toUpperCase())} ago</MenuItem>))}
              {UNITS.map(unit => (<MenuItem key={unit + '+'} value={unit + '+'} dense>{unit.replace(/\b([a-z])/, unit.substring(0, 1).toUpperCase())} from now</MenuItem>))}
            </Select>
          </Box>
          <FormGroup>
            <FormControlLabel control={<Switch value={roundToTheMinute} onChange={e => { doSetRelativeDate({ roundToTheMinute: e.target.checked }); }} />} label='Round to the minute' />
          </FormGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', border: 'solid 1px', borderRadius: 1, borderColor: 'rgba(0, 0, 0, 0.27)' }}>
            <Box sx={{ fontWeight: 'bold', fontSize: 12, width: 'auto', borderRight: 'solid 1px rgba(0, 0, 0, 0.27)', backgroundColor: '#ededed', p: 1 }}>{field === 'from' ? 'Start' : 'End'} date</Box>
            <Box sx={{ ml: 1 }}>{relativeFrom.format('MMM Do, YYYY @ HH:mm:ss.SSS')}</Box>
          </Box>
        </TabPanel>
        <TabPanel value='now' index={2} selected={selectedTab === 2} sx={{ maxWidth: 350 }}>
          <Typography variant='body1' gutterBottom>
            Setting the time to "now" means that on every refresh this time will be set to the time of the refresh.
          </Typography>
          <Button onClick={doSetDateAsNow} sx={{ width: '100%' }} variant='contained'>Set {field === 'from' ? 'start' : 'end'} date and time to now</Button>
        </TabPanel>
      </Box>
    </Popover>
  );
}

function QuickSelect ({ open, anchorEl, onClose, anchorOrigin, transformPopoverOrigin, setRange, startRefreshing, stopRefreshing }) {
  const [lastNext, setLastNext] = useState('last');
  const [period, setPeriod] = useState(1);
  const [units, setUnits] = useState('hours');

  const [refresh, setRefresh] = useState({ refreshing: false, period: 10, units: 'seconds' });

  const doSetRefresh = (refresh) => {
    setRefresh(refresh);
    if (refresh.refreshing) {
      startRefreshing(unitToMillis(refresh.period, refresh.units));
    } else {
      stopRefreshing();
    }
  };

  const applyQuickSelect = () => {
    const endpoint = (lastNext === 'next' ? '+' : '-') + period + units.charAt(0);
    const from = (lastNext === 'next' ? 'now' : endpoint);
    const to = (lastNext === 'next' ? endpoint : 'now');
    const expression = 'now' + endpoint;
    const label = (lastNext === 'next' ? 'Next' : 'Last') + ' ' + period + ' ' + units.charAt(0);
    console.log('Setting range:', from, to, expression);
    setRange({ expression, from, to, label, type: 'quick-selection' });
  };

  const chunk = (array, size) => {
    // This prevents infinite loops
    if (size < 1) throw new Error('Size must be positive');

    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const commonSelectionChunks = chunk(QUICK_SELECT_COMMON, QUICK_SELECT_COMMON.length / 2);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      tansformOrigin={transformPopoverOrigin}
      sx={{ p: 2 }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 'bold' }} variant='subtitle2'>Quick Select</Typography>
          <Select value={lastNext} size='small' onChange={e => { setLastNext(e.target.value); }}>
            <MenuItem value='last' dense>Last</MenuItem>
            <MenuItem value='next' dense>Next</MenuItem>
          </Select>
          <TextField
            sx={{ ml: 1 }} size='small'
            onChange={e => { setPeriod(e.target.value); }}
            type='number'
            value={period}
          />
          <Select sx={{ ml: 1 }} value={units} size='small' onChange={e => { setUnits(e.target.value); }}>
            {UNITS.map(unit => (<MenuItem key={unit} value={unit} dense>{unit}</MenuItem>))}
          </Select>
          <Button sx={{ ml: 1 }} variant='contained' onClick={applyQuickSelect}>Apply</Button>

        </Box>
        <Divider />
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }} variant='subtitle2'>Commonly used</Typography>
          <Grid container>
            {commonSelectionChunks.map((chunk, i) =>
              <Grid key={i} item sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                {chunk.map((opt, j) => <Link key={j} sx={{ cursor: 'pointer' }} onClick={e => { setRange({ ...opt, type: 'common-selection' }); }}>{opt.label}</Link>
                )}
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }} variant='subtitle2'>Refresh every</Typography>
          <Box sx={{ display: 'flex', flexDirecton: 'row', justifyContent: 'space-between' }}>
            <TextField
              size='small'
              onChange={e => { doSetRefresh({ ...refresh, period: e.target.value }); }}
              type='number'
              value={refresh.period}
            />
            <Select sx={{ flexGrow: 1, ml: 1 }} value={refresh.units} size='small' onChange={e => { doSetRefresh({ ...refresh, units: e.target.value }); }}>
              {REFRESH_UNITS.map(unit => (<MenuItem key={unit} value={unit} dense>{unit}</MenuItem>))}
            </Select>
            {refresh.refreshing && <Button sx={{ ml: 1 }} variant='contained' onClick={e => { doSetRefresh({ ...refresh, refreshing: false }); }} startIcon={<StopOutlinedIcon />}>Stop</Button>}
            {!refresh.refreshing && <Button sx={{ ml: 1 }} variant='contained' onClick={e => { doSetRefresh({ ...refresh, refreshing: true }); }} startIcon={<PlayArrowOutlinedIcon />}>Start</Button>}
          </Box>
        </Box>
      </Box>
    </Popover>
  );
}

export function TimeRangeSelector ({ sx }) {
  const { setFetchRange } = useContext(rangeContext);
  const [quickSelectAnchorEl, setQuickSelectAnchorEl] = useState(null);
  const [showingDates, setShowingDates] = useState(false);
  const [range, setRange] = useState({ from: '-1h', to: 'now', label: 'Last 1 hour', type: 'quick-selection' });
  const [rangeWasChanged, setRangeWasChanged] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [dateFieldAnchorEl, setDateFieldAnchorEl] = useState(null);
  const [dateFieldSelected, setDateFieldSelected] = useState(null);

  const onSetRange = (range) => {
    setRange(range);
    setQuickSelectAnchorEl(null);
    setRangeWasChanged(true);
  };

  const setDateOnField = (date, field, type) => {
    setRange({ ...range, [field]: date, type });
    setRangeWasChanged(true);
  };

  const refresh = () => {
    const resolvedRange = resolveRange(range);
    if (rangeIsValid(resolvedRange)) {
      setFetchRange(resolvedRange);
    }
    setRangeWasChanged(false);
  };

  const onStartRefreshing = (interval) => {
    if (refreshInterval != null) {
      clearInterval(refreshInterval);
    }
    setRefreshInterval(setInterval(refresh, interval));
    setQuickSelectAnchorEl(null);
  };

  const onStopRefreshing = () => {
    clearInterval(refreshInterval);
    setRefreshInterval(null);
    setQuickSelectAnchorEl(null);
  };

  const formatEndpoint = (endpoint, type) => {
    switch (type) {
      case 'absolute':
        return endpoint.toISOString();
      default:
        return '~' + endpoint.fromNow();
    }
  };

  const { from, to, fromIsNow, toIsNow } = resolveRange(range);
  const validRange = rangeIsValid({ from, to });

  return (
    <Box sx={sx}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Button sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, paddingLeft: 1, paddingRight: 1, width: 'auto' }} variant='contained' onClick={e => { setQuickSelectAnchorEl(e.currentTarget); }} endIcon={<KeyboardArrowDownIcon />}>
          <AccessTimeIcon />
        </Button>
        <Box sx={{ cursor: 'pointer', borderTopRightRadius: 4, borderBottomRightRadius: 4, border: 'solid 1px', borderColor: 'primary.main', width: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!showingDates && <Box sx={{ padding: 1 }} onClick={e => { if (!showingDates) { setShowingDates(true); } }}>{range.label}</Box>}
          {showingDates && (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Box
                sx={{
                  mr: 1,
                  flexGrow: 2,
                  padding: 1,
                  textAlign: 'center',
                  borderBottom: 'solid 4px',
                  ...(dateFieldSelected === 'from' ? { borderColor: 'primary.main' } : { borderColor: 'transparent' }),
                  ...(validRange === false ? { bgcolor: 'error.light', color: 'error.contrastText' } : {})
                }} onClick={e => { setDateFieldSelected('from'); setDateFieldAnchorEl(e.currentTarget); }}
              >
                {fromIsNow && 'now'}
                {!fromIsNow && formatEndpoint(from, range.type)}
              </Box>
              <ArrowForwardIcon />
              <Box
                sx={{
                  ml: 1,
                  flexGrow: 2,
                  padding: 1,
                  textAlign: 'center',
                  borderBottom: 'solid 4px',
                  ...(dateFieldSelected === 'to' ? { borderColor: 'primary.main' } : { borderColor: 'transparent' }),
                  ...(validRange === false ? { bgcolor: 'error.light', color: 'error.contrastText' } : {})
                }} onClick={e => { setDateFieldSelected('to'); setDateFieldAnchorEl(e.currentTarget); }}
              >
                {toIsNow && 'now'}
                {!toIsNow && formatEndpoint(to, range.type)}
              </Box>
            </Box>
          )}
          {!showingDates && <Link sx={{ cursor: 'pointer', padding: 1 }} onClick={e => { setShowingDates(true); }} underline='hover'>Show dates</Link>}
        </Box>
        <Button sx={{ ml: 1 }} disabled={validRange === false} variant='contained' onClick={refresh} startIcon={rangeWasChanged ? <SystemUpdateAltIcon /> : <RefreshIcon />}>{rangeWasChanged ? 'Update' : 'Refresh'}</Button>
      </Box>
      <FieldSelect
        open={Boolean(dateFieldAnchorEl)} anchorEl={dateFieldAnchorEl}
        onClose={() => { setDateFieldAnchorEl(null); setDateFieldSelected(null); }}
        field={dateFieldSelected}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformPopoverOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        setField={(value, field, type) => { setDateOnField(value, field, type); }}
      />
      <QuickSelect
        open={Boolean(quickSelectAnchorEl)}
        anchorEl={quickSelectAnchorEl}
        onClose={e => { setQuickSelectAnchorEl(null); }}
        setRange={onSetRange}
        startRefreshing={onStartRefreshing}
        stopRefreshing={onStopRefreshing}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformPopoverOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      />
    </Box>
  );
}
