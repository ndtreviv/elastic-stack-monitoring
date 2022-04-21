import { Box } from '@mui/material';
import { useLocation } from 'react-router';

export function TabPanel (props) {
  const { children, value, index, selected, ...other } = props;

  return (
    <Box
      role='tabpanel'
      hidden={!selected}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {selected && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

export function AnchorTabPanel (props) {
  const { children, value, ...other } = props;
  const location = useLocation();
  const hash = location.hash || '#overview';

  const selected = '#' + value === hash;

  if (!selected) return null;
  return (
    <Box
      role='tabpanel'
      hidden={!selected}
      id={`tabpanel-${hash.substring(1)}`}
      aria-labelledby={`tab-${hash.substring(1)}`}
      {...other}
    >
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Box>
  );
}
