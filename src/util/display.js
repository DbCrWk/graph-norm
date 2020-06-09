// @flow
import { inspect } from 'util';
import { raw } from './logger';

function display(o: any): string {
    const formattedO = inspect(o, { colors: true });
    raw(formattedO);
    return formattedO;
}

export default display;
