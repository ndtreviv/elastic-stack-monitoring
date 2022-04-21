import { useLocation, useNavigate } from 'react-router';
import Tabs from '@mui/material/Tabs';

export default function AnchorTabs (props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hash } = location;

  const { children } = props;
  const otherProps = { ...props };
  delete otherProps.children;

  const mapping = children.map(child => '#' + child.props.id);

  return (
    <Tabs {...otherProps} onChange={(e, newValue) => { navigate(document.location.pathname + mapping[newValue]); }} value={mapping.indexOf(hash) === -1 ? 0 : mapping.indexOf(hash)}>
      {children}
    </Tabs>
  );
}
