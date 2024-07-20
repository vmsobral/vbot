import axios from "axios";
import retry from "retry";

export class Client {
  #requestConfig;
  #retryOperation;

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
    this.#retryOperation = retry.operation({
      retries: 2,            // Maximum number of retry attempts
      factor: 2,             // Exponential backoff factor
      minTimeout: 1000,      // Minimum timeout (in milliseconds)
      maxTimeout: 10 * 1000, // Maximum timeout (in milliseconds)
      randomize: true,       // Randomize the timeouts
    });
  }

  makeRequestWithFaultTolerance(url, cb) {
    const config = this.#requestConfig;
    const operation = this.#retryOperation;

    operation.attempt(async function (currentAttempt) {
      // TODO: check for null or malformed url
      config.params = { url };
      // Make an HTTP GET request
      await axios.request(config)
        .then((response) => {
          // If the request is successful, resolve the Promise with the response body
          cb(null, JSON.parse(response.data.body));
        })
        .catch((error) => {
          // If there's an error, check if retry is allowed.
          if (operation.retry(error)) {
            console.debug(`retrying request to ${url}; retryNumber: ${operation.attempts}`);
            return;
          }

          // If all retry attempts are exhausted, reject with the main error
          cb(operation.mainError());
        });
    });
  };
}