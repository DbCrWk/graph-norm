// @flow
import pino from 'pino';

export const cli = pino({ level: process.env.LOG_LEVEL || 'info' });
export const debug = (namespace: string) => (title: string, data: { } = {}) => cli.debug({
    ...data,
    msg: `${namespace}: ${title}`,
});
export const error = (namespace: string) => (title: string, data: {} = {}): Error => {
    const msg = `${namespace}: ${title}`;
    cli.error({
        ...data,
        msg,
    });
    return new Error(msg);
};

// eslint-disable-next-line no-console
export const raw = console.log;
export const lib = cli;
export const debugLib = (namespace: string) => (
    subspace: string,
    title: string,
    data: { } = {},
) => lib.debug({
    ...data,
    msg: `${namespace} [${subspace}]: ${title}`,
});
export const errorLib = (namespace: string) => (
    subspace: string,
    title: string,
    data: {} = {},
): Error => {
    const msg = `${namespace} [${subspace}]: ${title}`;
    lib.error({
        ...data,
        msg,
    });
    return new Error(msg);
};

export const json = (
    { pretty }: { pretty?: boolean } = { pretty: false },
) => (o: {} = {}) => (pretty ? JSON.stringify(o, null, 4) : JSON.stringify(o));
