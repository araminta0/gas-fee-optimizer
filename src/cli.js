const readline = require('readline');
const GasFeeOptimizer = require('./optimizer');
const DataExporter = require('./exporter');

class CLI {
    constructor() {
        this.optimizer = new GasFeeOptimizer();
        this.exporter = new DataExporter(this.optimizer.analyzer);
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
        console.log('4. Export data');
        console.log('5. View exports');
        console.log('6. Exit');
        console.log('');
        
        this.rl.question('Select option (1-6): ', (answer) => {
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
                this.exportData();
                break;
            case '5':
                this.viewExports();
                break;
            case '6':
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

    exportData() {
        console.log(`\n--- Export Data ---`);
        console.log('1. Export to JSON');
        console.log('2. Export to CSV');
        console.log('3. Back to main menu');
        
        this.rl.question('Select format (1-3): ', (answer) => {
            switch (answer.trim()) {
                case '1':
                    const jsonResult = this.exporter.exportToJSON();
                    if (jsonResult.success) {
                        console.log(`Data exported to: ${jsonResult.path}`);
                        console.log(`Records: ${jsonResult.recordCount}`);
                    } else {
                        console.log(`Export failed: ${jsonResult.error}`);
                    }
                    break;
                case '2':
                    const csvResult = this.exporter.exportToCSV();
                    if (csvResult.success) {
                        console.log(`Data exported to: ${csvResult.path}`);
                        console.log(`Records: ${csvResult.recordCount}`);
                    } else {
                        console.log(`Export failed: ${csvResult.error}`);
                    }
                    break;
                case '3':
                    break;
                default:
                    console.log('Invalid option');
            }
            this.showMenu();
        });
    }

    viewExports() {
        const exports = this.exporter.listExports();
        console.log(`\n--- Export Files ---`);
        
        if (exports.length === 0) {
            console.log('No export files found');
        } else {
            exports.forEach((file, index) => {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                console.log(`${index + 1}. ${file.name} (${sizeMB}MB) - ${file.created.toLocaleDateString()}`);
            });
        }
        
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