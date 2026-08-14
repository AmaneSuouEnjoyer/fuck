// Save original fetch
const originalFetch = window.fetch;

// Override fetch to add cache‑buster to scenario data requests
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = String(input);
  }

  // Only modify requests for data.json inside scenarios
  if (url.includes('/scenarios/') && url.includes('data.json')) {
    const separator = url.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    url = `${url}${separator}v=${timestamp}`;

    // Update the input to the new URL
    if (typeof input === 'string') {
      input = url;
    } else if (input instanceof Request) {
      input = new Request(url, input);
    } else if (input instanceof URL) {
      input = new URL(url);
    }
  }

  return originalFetch.call(this, input as any, init);
};

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import OsegEditor from "./editor/OsegEditor";
import './index.css';
import About from "./website/About";
import ScenarioLoader from "./website/ScenarioLoader";

import {
    createHashRouter,
    RouterProvider
} from 'react-router-dom';
import Layout from './Layout.tsx';

const router = createHashRouter([
  {
    element: <Layout></Layout>,
    children: [
      {
        path: "/",
        element: <ScenarioLoader></ScenarioLoader>
      },
      {
        path: "/editor",
        element: <OsegEditor></OsegEditor>
      },
      {
        path: "/about",
        element: <About></About>
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
