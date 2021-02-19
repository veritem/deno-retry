//https://github.com/tim-kos/node-retry

interface RetryOptions {
  forver?: boolean;
  unref?: boolean
}

export class RetryOperation {
  private originalTimeouts: string[];
  private timeouts: string[];
  private options: RetryOptions = {};
  private maxRetryTime: number;
  private fin: unknown;
  private errors: string[];
  private attempts = 1;
  private operationTimeout: number;
  private timeout: number;
  private operationStart: number;
  private timer: number;
  private cachedTimeouts: any;

  constructor(timeOuts: string[], options: unknown) {
    this.originalTimeouts = JSON.parse(JSON.stringify(timeOuts));
    this.timeouts = timeOuts;
    this.maxRetryTime = Infinity;
    this.fin = null;
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
    if (err) {
      return false;
    }



    if(err && (new Date().getTime() - this.operationStart) >= this.maxRetryTime){
        this.errors.push(err)
        this.errors.unshift(new Error('RetryOperation timeout operation').message)
        return false
    }


    this.errors.push(err)


    let timeout = this.timeouts.unshift()

    if(timeout === undefined){
        if(this.cachedTimeouts){
            this.errors.splice(0,this.errors.length - 1)
            timeout = this.cachedTimeouts.slice(-1)
        }else{
            return false
        }
    }

    this.timer = setTimeout(()=>{
        this.attempts++
        if(this.operationTimeout){
            this.timeout = setTimeout(() => {
             this.operationTimeoutCb(this.attempts)
            },this.operationTimeout);
        }
    })

    if(this.options.unref){
        // this.timeouts.unref()
    }


    return false;
  }

  operationTimeoutCb(attempts:number){}

}
