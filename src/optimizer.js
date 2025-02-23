const axios = require('axios');
const cron = require('node-cron');
const GasAnalyzer = require('./analyzer');
const config = require('./config');
const logger = require('./logger');

class GasFeeOptimizer {
    constructor() {
        this.currentGasPrice = null;
        this.gasHistory = [];
        this.isRunning = false;
        this.analyzer = new GasAnalyzer();
    }

    async fetchGasPrice() {
        try {
            logger.debug('Fetching gas price data');
            const response = await axios.get(config.getApiUrl());
            
            if (!response.data || !response.data.result) {
                throw new Error('Invalid API response format');
            }

            const data = response.data.result;
            
            this.currentGasPrice = {
                slow: parseInt(data.SafeGasPrice) || 0,
                standard: parseInt(data.ProposeGasPrice) || 0,
                fast: parseInt(data.FastGasPrice) || 0,
                timestamp: Date.now()
            };

            if (this.currentGasPrice.standard === 0) {
                logger.warn('Received zero gas price from API');
                return;
            }

            this.gasHistory.push(this.currentGasPrice);
            this.analyzer.addDataPoint(this.currentGasPrice);
            
            if (this.gasHistory.length > config.get('historyLimit')) {
                this.gasHistory.shift();
            }

            const recommendation = this.analyzer.predictOptimalTime();
            const trend = this.analyzer.getTrend();

            logger.info('Gas price updated', {
                slow: this.currentGasPrice.slow,
                standard: this.currentGasPrice.standard,
                fast: this.currentGasPrice.fast,
                trend,
                recommendation: recommendation.recommendation
            });

            console.log(`Current gas prices - Slow: ${this.currentGasPrice.slow}, Standard: ${this.currentGasPrice.standard}, Fast: ${this.currentGasPrice.fast}`);
            console.log(`Trend: ${trend}, Recommendation: ${recommendation.recommendation}`);
            
        } catch (error) {
            logger.error('Failed to fetch gas price', { 
                error: error.message,
                url: config.getApiUrl()
            });
            console.error('Error fetching gas price:', error.message);
        }
    }

    start() {
        if (this.isRunning) {
            logger.warn('Optimizer already running');
            return;
        }
        
        this.isRunning = true;
        logger.info('Gas fee optimizer started');
        console.log('Gas fee optimizer started');
        
        this.fetchGasPrice();
        
        const interval = config.get('monitoringInterval');
        logger.info(`Scheduled monitoring every ${interval} minutes`);
        
        cron.schedule(`*/${interval} * * * *`, () => {
            if (this.isRunning) {
                this.fetchGasPrice();
            }
        });
    }

    stop() {
        this.isRunning = false;
        logger.info('Gas fee optimizer stopped');
        console.log('Gas fee optimizer stopped');
    }
}

module.exports = GasFeeOptimizer;