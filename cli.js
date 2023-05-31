require('dotenv').config();
const path = require('path');

const { CreateSpecs, SetupKey } = require('./lib');

const Setup = async () => {
    try {
        const cwd = process.cwd();
        let hubpath = path.join(cwd, 'hub').toString();

        const args = process.argv.slice(2);
        if (args[0] && args[0][0] === '/') {
            hubpath = args[0];
        } else if (args[0]) {
            hubpath = path.join(cwd, args[0]).toString();
        }

        await SetupKey(hubpath);
        await CreateSpecs(hubpath);

        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
};

Setup();
