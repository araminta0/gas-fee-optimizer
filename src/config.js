const fs = require('fs');
const path = require('path');

class Config {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'config.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const configData = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.warn('Failed to load config file, using defaults');
            return this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            etherscanApiKey: 'YourApiKeyToken',
            monitoringInterval: 5,
            historyLimit: 288,
            gasThresholds: {
                low: 20,
                medium: 50,
                high: 100
            },
            notifications: {
                enabled: false,
                threshold: 25
            },
            timeZone: 'UTC'
        };
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('Failed to save config:', error.message);
        }
    }

    getApiUrl() {
        return `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${this.config.etherscanApiKey}`;
    }
}

module.exports = new Config();