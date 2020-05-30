// @flow
import { inspect } from 'util';

function display(o: any) {
    // eslint-disable-next-line no-console
    console.log(inspect(o, { showHidden: false, depth: null, colors: true }));
}

export default display;
