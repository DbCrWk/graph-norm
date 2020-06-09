// @flow
import pino from 'pino';

export const cli = pino({ level: process.env.LOG_LEVEL || 'info' });
export const debug = (namespace: string) => (title: string, data: { } = {}) => cli.debug({
    ...data,
    msg: `${namespace}: ${title}`,
});

// eslint-disable-next-line no-console
export const raw = console.log;
export const lib = cli;
