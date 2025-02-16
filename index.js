const CLI = require('./src/cli');

async function main() {
    const cli = new CLI();
    await cli.start();
}

main().catch(console.error);