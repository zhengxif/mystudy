
const PENGDING = 'PENGDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
function isPromise(value){
    if((typeof value === 'object' && value!==null)  || typeof value =='function'){
        if(typeof value.then === 'function'){
            return true;
        }
    }
    return false
}
function resolvePromise(promise2, x, resolve, reject) {
    // x 来取决promise2是 成功还是失败
    if (x === promise2) {
        return rejec(
            new TypeError(
                "TypeError: Chaining cycle detected for promise #<Promise>11"
            )
        )
    }
    // 怎么判断x是不是一个promise
    // 如果x是常量，那就直接用这个结果将promise 成功掉即可
    let called;
    if ((typeof x === 'object' && x !== null) || typeof x == 'function') {
        // {}.then 所以x有可能定义了then方法
        // 有可能是promise
        try {
            let then = x.then; // 取then可能发生异常
            if (typeof then === 'function') {
                //这里就只能认为它是promise
                then.call(x,  y => {
                    if (called) return; // 调用成功后 就不能再调用失败
                    called = true;
                    // 递归解析当前x的promise的返回结果，因为promise成功后可能返回的还是promise
                    resolvePromise(promise2, y, resolve, reject);
                }, r => {
                    if (called) return; // 调用成功后 就不能再调用失败
                    called = true;
                    reject(r);
                })
            }else {
                // {}, 普通对象
                resolve(x);
            }
        } catch (error) {
            if (called) return; // 调用成功后 就不能再调用失败
            called = true;
            reject(error);
        }
    }else {
        //普通 字符串 number boolean
        resolve(x);
    }
}
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
    // x是当前then 成功或者失败的返回结果
    // x是不是普通值，如果是普通值就把值传递到下一个then中
    // x是不是promise， 如果是则要采用这个x的状态
    // 如果执行函数出错，则直接调用promise2的reject
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error };
        let promise2 = new Promise((resolve, reject) => {
            // 如果上个promise状态是FUlFILLED, 那么直接执行then中onFulfilled,并调用resolve
            if (this.status == FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        // 看x的返回结果，看一下x 是不是promise，在去让promise2 变成成功或者失败
                        resolvePromise(promise2, x, resolve, reject);
                        // resolve(x)
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
                        resolvePromise(promise2, x, resolve, reject);
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
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
                this.reejctCallBack.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
            }

        })
        return promise2;
    }
    static all(promises) {
        return new Promise((resolve, reject) => {
            let result = [];
            let index = 0;
            let processData = (i, y) => {
                result[i] = y;
                if (++index == promises.length) resolve(result); 
            }
            promises.forEach((promise, i) => {
                if(isPromise(promise)) {
                    promise.then( y => {
                        processData(i, y);
                    }, reject)
                }else {
                    processData(i, promise);
                }
            })
        })
    }
    static race(promises) {
        return Promise((resolve, reject) => {
            promises.forEach(promise => {
                if(isPromise(promise)) {
                    promise.then( y => {
                        resolve(y);
                    }, reject)
                }else {
                    resolve(promise);
                }
            })
        })
    }
    finally(cb) {
        return new Promise((resolve, reject) => {
            this.then(val => {
                cb();
                resolve(val)
            },error => {
                cb()
                reject(val);
            })
        })
    }
    static try(cb) {
        return new Promise((resolve, reject) => {
            resolve(cb);
        })
    }
}
Promise.defer = Promise.deferred = function() {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
};


new Promise((resolve, reject) => {
    reject(1)
}).then(data => console.log('成功：' + data), error => console.log('失败：'+error))


module.exports = Promise; 

