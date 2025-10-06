// Simple logger utility
export function createLogger(name) {
    return {
        info: (...args) => console.log(`[${name}] INFO:`, ...args),
        error: (...args) => console.error(`[${name}] ERROR:`, ...args),
        warn: (...args) => console.warn(`[${name}] WARN:`, ...args),
        debug: (...args) => console.log(`[${name}] DEBUG:`, ...args)
    };
}
