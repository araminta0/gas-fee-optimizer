const fs = require('fs');
const path = require('path');

class DataExporter {
    constructor(analyzer) {
        this.analyzer = analyzer;
    }

    exportToJSON(filename = null) {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalDataPoints: this.analyzer.priceHistory.length,
            data: this.analyzer.priceHistory,
            statistics: this.generateStatistics()
        };

        const fileName = filename || `gas-data-${new Date().toISOString().split('T')[0]}.json`;
        const filePath = path.join(process.cwd(), 'exports', fileName);

        this.ensureExportDir();
        
        try {
            fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
            return { success: true, path: filePath, recordCount: exportData.totalDataPoints };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    exportToCSV(filename = null) {
        if (this.analyzer.priceHistory.length === 0) {
            return { success: false, error: 'No data to export' };
        }

        const fileName = filename || `gas-data-${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = path.join(process.cwd(), 'exports', fileName);

        this.ensureExportDir();

        const headers = 'timestamp,date,slow,standard,fast\n';
        const csvData = this.analyzer.priceHistory.map(item => {
            const date = new Date(item.timestamp).toISOString();
            return `${item.timestamp},"${date}",${item.slow},${item.standard},${item.fast}`;
        }).join('\n');

        try {
            fs.writeFileSync(filePath, headers + csvData);
            return { success: true, path: filePath, recordCount: this.analyzer.priceHistory.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    generateStatistics() {
        if (this.analyzer.priceHistory.length === 0) return null;

        const prices = this.analyzer.priceHistory.map(item => item.standard);
        const sortedPrices = [...prices].sort((a, b) => a - b);

        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
            median: sortedPrices[Math.floor(sortedPrices.length / 2)],
            dataRange: {
                from: new Date(this.analyzer.priceHistory[0].timestamp).toISOString(),
                to: new Date(this.analyzer.priceHistory[this.analyzer.priceHistory.length - 1].timestamp).toISOString()
            }
        };
    }

    ensureExportDir() {
        const exportDir = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
    }

    listExports() {
        const exportDir = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(exportDir)) return [];

        try {
            return fs.readdirSync(exportDir).filter(file => 
                file.endsWith('.json') || file.endsWith('.csv')
            ).map(file => ({
                name: file,
                path: path.join(exportDir, file),
                size: fs.statSync(path.join(exportDir, file)).size,
                created: fs.statSync(path.join(exportDir, file)).mtime
            }));
        } catch (error) {
            return [];
        }
    }
}

module.exports = DataExporter;