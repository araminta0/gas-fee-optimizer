const axios = require('axios');
const cron = require('node-cron');

class GasFeeOptimizer {
    constructor() {
        this.currentGasPrice = null;
        this.gasHistory = [];
        this.isRunning = false;
    }

    async fetchGasPrice() {
        try {
            const response = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken');
            const data = response.data.result;
            
            this.currentGasPrice = {
                slow: parseInt(data.SafeGasPrice),
                standard: parseInt(data.ProposeGasPrice),
                fast: parseInt(data.FastGasPrice),
                timestamp: Date.now()
            };

            this.gasHistory.push(this.currentGasPrice);
            
            if (this.gasHistory.length > 100) {
                this.gasHistory.shift();
            }

            console.log(`Current gas prices - Slow: ${this.currentGasPrice.slow}, Standard: ${this.currentGasPrice.standard}, Fast: ${this.currentGasPrice.fast}`);
            
        } catch (error) {
            console.error('Error fetching gas price:', error.message);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Gas fee optimizer started');
        
        this.fetchGasPrice();
        
        cron.schedule('*/5 * * * *', () => {
            this.fetchGasPrice();
        });
    }

    stop() {
        this.isRunning = false;
        console.log('Gas fee optimizer stopped');
    }
}

module.exports = GasFeeOptimizer;