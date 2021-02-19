//https://github.com/tim-kos/node-retry

class RetryOperation {
  private originalTimeouts: string;
  private timeouts: unknown;
  private options: unknown;
  private maxRetryTime: number;
  private fin: unknown;
  private errors: string[];
  private attempts: number;
  private operationTimeout: unknown;
  private operationTimeoutCb:unknown;
  private timeout:unknown;
  private operationStart:unknown;
  private timer:unknown;

  constructor(timeOuts: unknown, options: unknown) {
    this.originalTimeouts = JSON.parse(JSON.stringify(timeOuts));
    this.timeouts = timeOuts;
    this.maxRetryTime = Infinity;
    this.fin = null;
    this.errors = [];
    this.attempts = 1;
    this.operationTimeout = null;
    this.operationTimeoutCb = null
    this.timeout = null;
    this.operationStart = null;
    this.timer = null;
  }
}
