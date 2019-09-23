class Observer {
    constructor(data) {
        // 劫持
        this.observer(data);
    }
    observer(data) {
        if(typeof data !== 'object') return;
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
            this.observer(key);
        })
    }
    defineReactive(data, key, value) {
        debugger
        let dep = new Dep();
        let that = this;
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set(newValue) {
                if (newValue != value) {
                    value = newValue;
                    dep.notify();
                    that.observer(newValue);
                }
            }
        })
    }
}

class Dep {
    constructor() {
        // 观察者数组
        this.subs = [];
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach( watcher => {
            watcher.updater();
        })
    }
}