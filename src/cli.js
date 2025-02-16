const readline = require('readline');
const GasFeeOptimizer = require('./optimizer');

class CLI {
    constructor() {
        this.optimizer = new GasFeeOptimizer();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('=== Gas Fee Optimizer CLI ===');
        console.log('Starting monitoring...\n');
        
        await this.optimizer.start();
        
        this.showMenu();
    }

    showMenu() {
        console.log('\nCommands:');
        console.log('1. Current prices');
        console.log('2. Get recommendation');
        console.log('3. Show trend');
        console.log('4. Exit');
        console.log('');
        
        this.rl.question('Select option (1-4): ', (answer) => {
            this.handleCommand(answer);
        });
    }

    handleCommand(command) {
        switch (command.trim()) {
            case '1':
                this.showCurrentPrices();
                break;
            case '2':
                this.showRecommendation();
                break;
            case '3':
                this.showTrend();
                break;
            case '4':
                this.exit();
                break;
            default:
                console.log('Invalid option');
                this.showMenu();
        }
    }

    showCurrentPrices() {
        if (!this.optimizer.currentGasPrice) {
            console.log('No data available yet, please wait...');
        } else {
            const prices = this.optimizer.currentGasPrice;
            console.log(`\n--- Current Gas Prices ---`);
            console.log(`Slow:     ${prices.slow} gwei`);
            console.log(`Standard: ${prices.standard} gwei`);
            console.log(`Fast:     ${prices.fast} gwei`);
            console.log(`Updated:  ${new Date(prices.timestamp).toLocaleString()}`);
        }
        this.showMenu();
    }

    showRecommendation() {
        const recommendation = this.optimizer.analyzer.predictOptimalTime();
        console.log(`\n--- Recommendation ---`);
        console.log(`Status: ${recommendation.recommendation}`);
        if (recommendation.confidence) {
            console.log(`Confidence: ${recommendation.confidence}%`);
            if (recommendation.currentPrice && recommendation.avgPrice) {
                console.log(`Current: ${recommendation.currentPrice} gwei`);
                console.log(`24h avg: ${recommendation.avgPrice} gwei`);
            }
        }
        this.showMenu();
    }

    showTrend() {
        const trend = this.optimizer.analyzer.getTrend();
        console.log(`\n--- Price Trend ---`);
        console.log(`Current trend: ${trend}`);
        this.showMenu();
    }

    exit() {
        console.log('Goodbye!');
        this.optimizer.stop();
        this.rl.close();
        process.exit(0);
    }
}

module.exports = CLI;