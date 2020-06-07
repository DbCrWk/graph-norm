// @flow
import fs from 'fs';
import clear from 'clear';
import yargs from 'yargs';

import parse from '../workflow/parse';

clear();

// NOTE: this is just how you have to use yargs
// eslint-disable-next-line no-unused-expressions
yargs
    .scriptName('grano')
    .usage('$0 <cmd> [args]')
    .command(
        'parse <scaffold>',
        'Output a parse tree for a scaffold file',
        builder => {
            builder
                .positional('scaffold', {
                    type: 'string',
                    describe: 'the scaffold file',
                })
                .coerce('scaffold', arg => JSON.parse(fs.readFileSync(arg).toString()))
                .fail((msg, e) => {
                    /* eslint-disable no-console */
                    console.error(e);
                    console.error('Scaffold file is not valid (either not found or not valid JSON)');
                    console.error(msg);
                    process.exit(1);
                });
        },
        parse,
    )
    .demandCommand()
    .help()
    .argv;
