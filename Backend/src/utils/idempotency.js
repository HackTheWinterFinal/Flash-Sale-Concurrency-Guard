const redis = require("../config/redis");

/**
 * Checks if an operation has already been performed.
 * @param {string} key - The unique key for the operation.
 * @returns {Promise<boolean>} - True if already performed, false otherwise.
 */
exports.isIdempotent = async (key) => {
    const result = await redis.get(key);
    return result !== null;
};

/**
 * Marks an operation as performed.
 * @param {string} key - The unique key for the operation.
 * @param {string} value - The value to store (e.g., "true" or "success").
 * @param {number} ttl - Time to live in seconds (optional).
 */
exports.markIdempotent = async (key, value = "true", ttl = 86400) => {
    if (ttl) {
        await redis.set(key, value, "EX", ttl);
    } else {
        await redis.set(key, value);
    }
};
