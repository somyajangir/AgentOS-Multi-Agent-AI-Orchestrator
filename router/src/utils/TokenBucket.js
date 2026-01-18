
/**
 * Simple Token Bucket implementation for Rate Limiting.
 * Allows a burst of requests up to 'capacity', then refills at 'refillRate' tokens per second.
 */
export class TokenBucket {
    /**
     * @param {number} capacity - Max number of tokens in the bucket (burst size).
     * @param {number} refillRate - Tokens added per second.
     */
    constructor(capacity, refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }

    /**
     * Refills tokens based on time elapsed since last check.
     */
    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000; // seconds
        if (elapsed > 0) {
            const addedTokens = elapsed * this.refillRate;
            this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
            this.lastRefill = now;
        }
    }

    /**
     * Attempts to consume a token.
     * @returns {boolean} True if token consumed, False if empty.
     */
    tryConsume() {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }

    /**
     * Helper to get wait time estimation (not used for rejection, but for info)
     */
    getTimeUntilNextToken() {
        this.refill();
        if (this.tokens >= 1) return 0;
        const required = 1 - this.tokens;
        return (required / this.refillRate) * 1000; // ms
    }
}
