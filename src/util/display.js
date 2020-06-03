// @flow
import { inspect } from 'util';

function display(o: any): string {
    const formattedO = inspect(o, { colors: true });
    // eslint-disable-next-line no-console
    console.log(formattedO);
    return formattedO;
}

export default display;
