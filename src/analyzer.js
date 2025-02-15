class GasAnalyzer {
    constructor() {
        this.priceHistory = [];
    }

    addDataPoint(gasData) {
        this.priceHistory.push(gasData);
        if (this.priceHistory.length > 288) { // keep 24h of data (288 * 5min)
            this.priceHistory.shift();
        }
    }

    getAveragePrice(hours = 1) {
        const pointsNeeded = Math.min(hours * 12, this.priceHistory.length);
        const recentData = this.priceHistory.slice(-pointsNeeded);
        
        if (recentData.length === 0) return null;

        const sum = recentData.reduce((acc, data) => acc + data.standard, 0);
        return Math.round(sum / recentData.length);
    }

    predictOptimalTime() {
        if (this.priceHistory.length < 12) {
            return { recommendation: 'Wait for more data', confidence: 0 };
        }

        const current = this.priceHistory[this.priceHistory.length - 1];
        const avg24h = this.getAveragePrice(24);
        
        if (!avg24h) return { recommendation: 'Insufficient data', confidence: 0 };

        if (current.standard <= avg24h * 0.8) {
            return { 
                recommendation: 'Good time to transact', 
                confidence: 85,
                currentPrice: current.standard,
                avgPrice: avg24h 
            };
        } else if (current.standard >= avg24h * 1.2) {
            return { 
                recommendation: 'Wait for lower prices', 
                confidence: 75,
                currentPrice: current.standard,
                avgPrice: avg24h 
            };
        } else {
            return { 
                recommendation: 'Prices are average', 
                confidence: 60,
                currentPrice: current.standard,
                avgPrice: avg24h 
            };
        }
    }

    getTrend() {
        if (this.priceHistory.length < 6) return 'unknown';
        
        const recent = this.priceHistory.slice(-6);
        const older = this.priceHistory.slice(-12, -6);
        
        const recentAvg = recent.reduce((sum, data) => sum + data.standard, 0) / recent.length;
        const olderAvg = older.reduce((sum, data) => sum + data.standard, 0) / older.length;
        
        if (recentAvg > olderAvg * 1.1) return 'rising';
        if (recentAvg < olderAvg * 0.9) return 'falling';
        return 'stable';
    }
}

module.exports = GasAnalyzer;