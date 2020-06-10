// @flow
import readline from 'readline';

function readStdInToString(): Promise<string> {
    return new Promise(resolve => {
        let output = '';

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });

        rl.on('line', line => {
            output += line;
        });

        rl.on('close', () => {
            resolve(output);
        });
    });
}

export default readStdInToString;
