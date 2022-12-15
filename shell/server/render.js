import React from 'react';
import {renderToPipeableStream} from 'react-dom/server';
import {Helmet} from 'react-helmet';
import App from '../src/components/App';

export default async (req, res, next) => {
    const helmet = Helmet.renderStatic();
    let didError = false;

    const {getServerSideProps} = await import('remote1/contentServer')

    const preloadedState = await getServerSideProps({req, res})

    const stream = renderToPipeableStream(<App {...preloadedState} />, {
        onAllReady() {
            res.statusCode = didError ? 500 : 200;
            res.setHeader('Content-type', 'text/html');
            res.write(`<!DOCTYPE html`);
            res.write(`<html ${helmet.htmlAttributes.toString()}>
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
      </head>
      <body>`);
            res.write(`<div id="root">`);
            stream.pipe(res);
            res.write(`</div>`);
            res.write(`<script>window.pageState = ${JSON.stringify(preloadedState).replace(/</g, '\\x3c')}</script>`)
            res.write(`<script async data-chunk="main" src="http://localhost:3000/static/main.js"></script>`);
            res.write(`</body></html>`);
        },
        onShellError() {
            res.statusCode = 500;
            res.send(`<h1>An error occurred</h1>`)
        },
        onError(err) {
            didError = true;
            console.error(err);
        }
    })
};