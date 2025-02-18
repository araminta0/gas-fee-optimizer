const axios = require('axios');
const cron = require('node-cron');
const GasAnalyzer = require('./analyzer');
const config = require('./config');

class GasFeeOptimizer {
    constructor() {
        this.currentGasPrice = null;
        this.gasHistory = [];
        this.isRunning = false;
        this.analyzer = new GasAnalyzer();
    }

    async fetchGasPrice() {
        try {
            const response = await axios.get(config.getApiUrl());
            const data = response.data.result;
            
            this.currentGasPrice = {
                slow: parseInt(data.SafeGasPrice),
                standard: parseInt(data.ProposeGasPrice),
                fast: parseInt(data.FastGasPrice),
                timestamp: Date.now()
            };

            this.gasHistory.push(this.currentGasPrice);
            this.analyzer.addDataPoint(this.currentGasPrice);
            
            if (this.gasHistory.length > config.get('historyLimit')) {
                this.gasHistory.shift();
            }

            const recommendation = this.analyzer.predictOptimalTime();
            const trend = this.analyzer.getTrend();

            console.log(`Current gas prices - Slow: ${this.currentGasPrice.slow}, Standard: ${this.currentGasPrice.standard}, Fast: ${this.currentGasPrice.fast}`);
            console.log(`Trend: ${trend}, Recommendation: ${recommendation.recommendation}`);
            
        } catch (error) {
            console.error('Error fetching gas price:', error.message);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Gas fee optimizer started');
        
        this.fetchGasPrice();
        
        const interval = config.get('monitoringInterval');
        cron.schedule(`*/${interval} * * * *`, () => {
            this.fetchGasPrice();
        });
    }

    stop() {
        this.isRunning = false;
        console.log('Gas fee optimizer stopped');
    }
}

module.exports = GasFeeOptimizer;