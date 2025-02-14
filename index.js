const GasFeeOptimizer = require('./src/optimizer');

async function main() {
    console.log('Starting Gas Fee Optimizer...');
    
    const optimizer = new GasFeeOptimizer();
    await optimizer.start();
}

main().catch(console.error);