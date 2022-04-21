import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import { TabPanel, AnchorTabPanel } from './TabPanel';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('TabPanel renders based on selected', () => {
  act(() => {
    render(<TabPanel index={0} selected>Content</TabPanel>, container);
  });
  expect(container.textContent).toBe('Content');
  expect(container.querySelector('[role="tabpanel"]').getAttribute('hidden')).toEqual(
    null
  );

  act(() => {
    render(<TabPanel index={0}>Content</TabPanel>, container);
  });
  expect(container.textContent).toBe('');
  expect(container.querySelector('[role="tabpanel"]').getAttribute('hidden')).toEqual(
    ''
  );
});

it('TabPanel renders even with no children', () => {
  act(() => {
    render(<TabPanel index={0} selected />, container);
  });
  expect(container.textContent).toBe('');
  expect(container.querySelector('[role="tabpanel"]').getAttribute('hidden')).toEqual(
    null
  );
});

it('AnchorTabPanel renders based on selected', () => {
  const history = createMemoryHistory();
  history.push('/path/to#tab1');
  act(() => {
    render(<Router location={history.location} navigator={history}><AnchorTabPanel value='tab1' index={0} selected>Content</AnchorTabPanel></Router>, container);
  });
  expect(container.textContent).toBe('Content');
  const tp = container.querySelector('[role="tabpanel"]');
  expect(tp.getAttribute('hidden')).toEqual(null);
  expect(tp.getAttribute('id')).toEqual('tabpanel-tab1');
  expect(tp.getAttribute('aria-labelledby')).toEqual('tab-tab1');

  act(() => {
    render(<Router location={history.location} navigator={history}><AnchorTabPanel value='tab2' index={0} selected>Content</AnchorTabPanel></Router>, container);
  });
  expect(container.textContent).toBe('');
  expect(container.querySelector('[role="tabpanel"]')).toEqual(null);
});

it('AnchorTabPanel renders even with no children', () => {
  const history = createMemoryHistory();
  history.push('/path/to#tab1');
  act(() => {
    render(<Router location={history.location} navigator={history}><AnchorTabPanel value='tab1' index={0} selected /></Router>, container);
  });
  expect(container.textContent).toBe('');
  const tp = container.querySelector('[role="tabpanel"]');
  expect(tp.getAttribute('hidden')).toEqual(null);
  expect(tp.getAttribute('id')).toEqual('tabpanel-tab1');
  expect(tp.getAttribute('aria-labelledby')).toEqual('tab-tab1');
});
