/* eslint-disable no-param-reassign */
import type { Request } from 'express';
import type { Options } from 'http-proxy-middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';

const originalOptions: Options = {
  // TODO: need to resolve target by setting or domain name
  target: 'https://backend.bedkingdom.co.uk.cfstack.com',
  changeOrigin: true, // needed for virtual hosted sites
  ws: false, // proxy websockets
  pathRewrite: {
    // '^/api/old-path': '/api/new-path', // rewrite path
    // '^/api/rest': '/rest', // remove base path
    '^/proxy/bedkingdom-stg': '', // remove base path
    '^/proxy/bedkingdom-stg/graphql': 'graphql', // remove base path
  },
  secure: false,
  onProxyReq: (_proxyReq, req: Request) => {
    console.log(
      `[Global Functional Middleware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
    );
  },
  router: {
    // TODO: config for development
    // when request.headers.host == 'dev.localhost:3000',
    // override target 'http://www.example.org' to 'http://localhost:8000'
    // 'localhost:3000': 'https://pcms-stg.yutang.vn',
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true'; // add new
    proxyRes.headers['Access-Control-Allow-Headers'] = '*'; // add new header
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // add new header

    // Fix: Error: chunked encoding not supported
    if (proxyRes.headers['transfer-encoding'] === 'chunked') {
      delete proxyRes.headers['transfer-encoding'];
    }
    // delete proxyRes.headers['x-removed']; // remove header from response
  },
};

export const bedkingdomStgProxy = createProxyMiddleware(
  ['/proxy/bedkingdom-stg/**'],
  originalOptions,
);
