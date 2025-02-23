const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, message, extra = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(extra && { extra })
        };

        const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${extra ? ` | ${JSON.stringify(extra)}` : ''}\n`;
        
        console.log(`[${level.toUpperCase()}] ${message}`);
        
        const logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, logLine);
    }

    info(message, extra = null) {
        this.log('info', message, extra);
    }

    warn(message, extra = null) {
        this.log('warn', message, extra);
    }

    error(message, extra = null) {
        this.log('error', message, extra);
    }

    debug(message, extra = null) {
        this.log('debug', message, extra);
    }

    getLogs(date = null) {
        const logDate = date || new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `app-${logDate}.log`);
        
        try {
            return fs.readFileSync(logFile, 'utf8').split('\n').filter(line => line.trim());
        } catch (error) {
            return [];
        }
    }

    cleanOldLogs(daysToKeep = 7) {
        try {
            const files = fs.readdirSync(this.logDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    this.info(`Deleted old log file: ${file}`);
                }
            });
        } catch (error) {
            this.error('Failed to clean old logs', { error: error.message });
        }
    }
}

module.exports = new Logger();