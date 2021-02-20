//https://github.com/tim-kos/node-retry

//@copyright 2021  deno-rety by Makuza Mugabo Verite

interface RetryOptions {
  forver?: boolean;
  unref?: boolean;
}

interface Error {
  message: string;
}

export type timeoutOps = {
  timeout?: number;
  cb?: () => void;
};

export class RetryOperation {
  private originalTimeouts: string[];
  private timeouts: string[];
  private options: RetryOptions = {};
  private maxRetryTime: number;
  private fn: ((attempts: number) => void) | undefined;
  private errors: Error[];
  private attempts = 1;
  private operationTimeout: number;
  private timeout: number;
  private operationStart: number;
  private timer: number;
  private cachedTimeouts: unknown;

  constructor(timeOuts: string[], options: unknown) {
    this.originalTimeouts = JSON.parse(JSON.stringify(timeOuts));
    this.timeouts = timeOuts;
    this.maxRetryTime = Infinity;
    this.errors = [];
    this.attempts = 1;
    this.operationTimeout = 0;
    this.timeout = 0;
    this.operationStart = 0;
    this.timer = 0;

    if (this.options.forver) {
      this.cachedTimeouts = this.timeouts.slice(0);
    }
  }

  reset() {
    this.attempts = 1;
    this.timeouts = this.originalTimeouts.slice(0);
  }

  attemps(fn: (attempts: number) => void, timeOutOps?: timeoutOps) {
    this.fn = fn;

    if (timeOutOps) {
      if (timeOutOps.timeout) {
        this.operationTimeout = timeOutOps.timeout;
      }
      if (timeOutOps.cb) {
        this.operationTimeoutCb = timeOutOps.cb;
      }
    }

    this.operationStart = new Date().getTime();
    this.fn(this.attempts);
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timeouts = [];
    this.cachedTimeouts = null;
  }

  retry(err: Error): boolean {
    if (this.timeouts) {
      clearTimeout(this.timeout);
    }

    if (!err) return false;

    if (
      err && (new Date().getTime() - this.operationStart) >= this.maxRetryTime
    ) {
      this.errors.push(err);
      this.errors.unshift({
        message: "RetryOperation timeout occurred",
      });
      return false;
    }

    this.errors.push(err);

    let timeout = this.timeouts.shift();

    if (timeout === undefined) {
      if (this.cachedTimeouts) {
        this.errors.splice(0, this.errors.length - 1);
        timeout = (this.cachedTimeouts as string);
      } else {
        return false;
      }
    }

    this.timer = setTimeout(() => {
      this.attempts++;
      if (this.operationTimeoutCb) {
        this.timeout = setTimeout(() => {
          this.operationTimeoutCb(this.attempts);
        }, this.operationTimeout);

        if (this.options.unref) {
          // this.timeout.unref()
        }
      }
      // this.fn(this.attemps)
    }, Number(timeout));

    return true;
  }

  operationTimeoutCb(attempts: number) {}

  getErrors() {
    return this.errors;
  }

  getAttemps() {
    return this.attempts;
  }

  mainError() {
    if (this.errors.length === 0) {
      return null;
    }

    let mainError = null;
    let mainErrorCount = 0;
    let error;
    let count = 0;

    for (let i = 0; i < this.errors.length; i++) {
      error = this.errors[i];
      count += 1;

      if (count >= mainErrorCount) {
        mainError = error;
        mainErrorCount = count;
      }
    }
    return mainError;
  }
}
