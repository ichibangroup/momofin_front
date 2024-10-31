const log = {
    info: (message, data = {}) => console.info(`INFO: ${message}`, data),
    warn: (message, data = {}) => console.warn(`WARN: ${message}`, data),
    error: (message, data = {}) => console.error(`ERROR: ${message}`, data),
};

export default log;
