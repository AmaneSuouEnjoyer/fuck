const originalFetch = window.fetch;

window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  let url: string;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    url = input.url; // Request object
  }

  if (url.includes('data.json') || url.includes('logic.js')) {
    const sep = url.includes('?') ? '&' : '?';
    const bustedUrl = `${url}${sep}v=${BUILD_VERSION}`;
    return originalFetch(bustedUrl, { ...init, cache: 'no-store' });
  }

  return originalFetch(input, init);
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
