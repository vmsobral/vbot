import axios from "axios";
import { config } from "dotenv";

export class Client {
    #requestConfig;
    #retryOptions;

    constructor() {
        config();

        this.#requestConfig = {
            method: 'GET',
            url: process.env.SCRAPE_NINJA_URL,
            headers: {
              'X-RapidAPI-Key': process.env.SCRAPE_NINJA_KEY,
              'X-RapidAPI-Host': process.env.SCRAPE_NINJA_HOST
            }
        };
        this.#retryOptions = {
            retries: 5,          // Maximum number of retry attempts
            factor: 2,             // Exponential backoff factor
            minTimeout: 5000,      // Minimum timeout (in milliseconds)
            maxTimeout: 20 * 1000, // Maximum timeout (in milliseconds)
            randomize: true,       // Randomize the timeouts
            forever: true
        };
    }

    async requestCooldown() {
        let timeout = this.#retryOptions.minTimeout;
        if (this.#retryOptions.randomize) {
            const c = Math.random();
            const maxt = this.#retryOptions.maxTimeout;
            const mint = this.#retryOptions.minTimeout;
            timeout = c * maxt + (1 - c) * mint;
        }
        
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    async makeRequestWithFaultTolerance(url, options) {
        try {
            let requestConfig = this.#requestConfig;
            requestConfig.params = { url };
            const response = await axios.request(requestConfig);
            return JSON.parse(response.data.body);

        } catch(err) {
            console.log("request error", err.message);
            if (!options) {
                options = this.#retryOptions;
            }
            // If error, check if attempts are exhausted
            if (options.retries === 0 && !options.forever) {
                console.log("done retrying");
                throw err;
            }

            // Retry with cooldown
            await this.requestCooldown();
            if (!options.forever) {
                options.retries--;
                console.log(`retrying. Left: ${options.retries}`);
            }
            return this.makeRequestWithFaultTolerance(url, options);
        }
    }
}