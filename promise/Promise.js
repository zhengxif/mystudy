const PENGDING = 'pengding';
        const FULFILLED = 'fulfilled';
        const REJECTED = 'rejected';
        class MyPromise {
            constructor(handler) {
                this.status = PENGDING;
                this.value = undefined;
                // 成功的队列
                this.fulfilledQueue = [];
                // 失败的队列
                this.rejectedQueue = [];
                try {
                    handler(this.resolve.bind(this), this.reject.bind(this))
                } catch (error) {
                    this.reject(error);
                }
            }
            resolve(value) {
                const run = () => {
                    if (this.status !== PENGDING) return;
                    const runFulfilled = value => {
                        let cb;
                        while(cb = this.fulfilledQueue.shift()) {
                            cb(value);
                        }
                    }
                    const runRejected = value => {
                        let cb;
                        while(cb = this.rejectedQueue.shift()) {
                            cb(value);
                        }
                    }
                    if (value instanceof MyPromise) {
                       value.then(value => {
                           this.value = value;
                           this.status = FULFILLED;
                           runFulfilled(value);
                       })
                    } else {
                        this.value = value; 
                        this.status = FULFILLED;
                        runFulfilled(value);
                    }
                }

                setTimeout(run, 0)
            }
            reject(value) {
                const run = () => {
                    if(this.status !== PENGDING) return;
                    this.status = REJECTED;
                    this.value = value;
                    let cb;
                    while(cb = this.rejectedQueue.shift()) {
                        cb(value);
                    }
                }
                setTimeout(run, 0)
            }
            then(onFulfilled, onRejected) {
                const { status, value } = this;
                return new MyPromise((onFulfilledNext, onRejectedNext) => {
                    // 成功的回调队列项
                    const fulfilled = value => {
                        try {
                            if (typeof onFulfilled !== 'function') {
                                onFulfilledNext(value);
                            } else {
                                let res = onFulfilled(value);
                                if (res instanceof MyPromise) {
                                    res.then(value => {
                                        onFulfilledNext(value);
                                    }, error => {
                                        onRejectedNext(error);
                                    })
                                } else {
                                    onFulfilledNext(value);
                                }
                            }
                        } catch (error) {
                            onRejectedNext(error);
                        }
                    }
                    //是失败的回调队列项
                    const rejected = error => {
                        try {
                            if (typeof onRejected !== 'function') {
                                onRejectedNext(error);
                            }else {
                                let res = onRejected(error);
                                if (res instanceof MyPromise) {
                                    res.then(onFulfilledNext, onRejectedNext);
                                }else {
                                    onFulfilledNext(error);
                                }
                            }
                        } catch (error) {
                            onRejectedNext(error);
                        }
                    }
                    switch (status) {
                        case PENGDING:
                            this.fulfilledQueue.push(fulfilled);
                            this.rejectedQueue.push(rejected);
                            break;
                        case FULFILLED:
                            break;
                        case REJECTED:
                            break;
                    }
                }) 
            }
            catch(onRejected) {
                return this.then(undefined, onRejected);
            }
            static resolve(value) {
                if (value instanceof MyPromise) return value;
                return new MyPromise(resolve => resolve(value))
            }
            static reject(error) {
                return new MyPromise((resolve, reject) => reject(error))
            }
            static all(list) {
                return new MyPromise((resolve, reject) => {
                    let count = 0;
                    let arr = [];
                    for(let [i, p] of list.entrise()) {
                        this.resolve(p).then(value => {
                            if (count == list.length)  resolve(arr);
                            count ++;
                            arr[i] = value;
                        }, error => {
                            reject(error);
                        })
                    }
                })
            }
            static race(list) {
                return new MyPromise((resolve, reject) => {
                    for( let p of list) {
                        this.resolve(p).then(value => {
                            resolve(value);
                        }, error => {
                            reject(error)
                        })
                    }
                })
            }
            finally(cb) {
                return this.then((value) => {
                    MyPromise.resolve(cb()).then(() => value)
                }, reason => {
                    MyPromise.resolve(cb()).then(() => error)
                })
            }
        }

        new MyPromise((resolve, reject) => {
            reject(5)
        }).then(value => {
            console.log(value)
        }).catch(error => {
            console.log(error)
        })