
const PENGDING = 'PENGDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class Promise {
    constructor(executor) {
        debugger
        this.status = PENGDING;
        this.value = undefined;
        this.reason = undefined;
        this.resolveCallBack = [];
        this.rejectCallBack = [];
        let resolve = value => {
            this.status = FULFILLED;
            this.value = value;
            this.resolveCallBack.forEach(fn => fn());
        }
        let reject = reason => {
            this.status = REJECTED;
            this.reason = reason;
            this.rejectCallBack.forEach( fn => fn());
        }
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }
    then(onFulfilled, onRejected) {
        let promise2 = new Promise((reoslve, reject) => {
            // 如果上个promise状态是FUlFILLED, 那么直接执行then中onFulfilled,并调用resolve
            if (this.status == FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        resolve(x);
                    } catch (error) {
                        reject(error);
                    }
                })
            }
            // 如果上个promise状态是REJECTED, 那么直接执行then中onRejected,并调用reject
            if (this.status == REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolve(x);
                    } catch (error) {
                        reject(error);
                    }
                })
            }
            if (this.status == PENGDING) {
                this.resolveCallBack.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolve(x);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
                this.reejctCallBack.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolve(x);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
            }

        })
        return promise2;
    }
}

new Promise((resolve, reject) => {
    resolve(1)
}).then(data => console.log(data))