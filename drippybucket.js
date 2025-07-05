class DrippyBucket {
  #queue = [];
  #rate;
  #limit = undefined;
  #lastFetched_mil = 0;

  /**
   * A leaky bucket that does rates of s^-1, numbers over 1 will be considered per second and numbers below 1 will be considered in milliseconds
   * @param {Number} rate
   * @returns DrippyBucket
   */
  #setRateLimit(rate) {
    if (rate < 1) {
      this.rate = rate * 1000;
      return;
    }

    this.rate = (1 / rate) * 1000;
    if (typeof this.rate !== Number) {
      console.warn("Rate not set");
      this.rate = 0;
    }
  }

  constructor(rate, limit) {
    this.#setRateLimit(rate);
    if (typeof limit === Number && limit > -1) {
      this.#limit = limit;
    } else {
      console.warn("Limit not set");
    }

    return this;
  }

  add(obj) {
    if (this.#checkokayinsert()) {
      this.#queue.push(obj);
      return true;
    }
    return false;
  }

  insert(obj) {
    return this.add(obj);
  }

  push(obj) {
    return this.add(obj);
  }

  pushBack(obj) {
    return this.add(obj);
  }

  insertBlocking(obj) {
    while (this.add(obj) == false) {}
  }

  async insertAsync(obj) {
    while (this.add(obj) == false) {}
  }

  /**
   * Checks if able to insert
   * @returns Boolean
   */
  #checkokayinsert() {
    if (this.#limit < this.#queue.length || this.#limit === undefined) {
      return true;
    } else {
      return false;
    }
  }

  #get() {
    return this.#queue.shift();
  }

  getBlocking() {
    let obj = undefined;
    while (Date.now() < this.#lastFetched_mil + this.#rate) {}

    obj = this.#get();
    if (obj !== undefined) {
      this.#lastFetched_mil = Date.now();
    }

    return obj;
  }

  async getAsync() {
    return this.getBlocking();
  }
}
