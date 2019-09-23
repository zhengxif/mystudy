class Observer  {
    constructor(data) {
        this.observer(data);
    }
    observer(data) {
        if (!data || typeof data !== 'object') return;
        Reflect.ownKeys(data).forEach( key => {
            this.defineReactive(data, key, data[key]);
            this.observer(key);
        })
    }
    defineReactive(data, key, value) {
        let dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newValue) {
                if (newValue != value) {
                    value = newValue;
                    dep.notify();
                }
            }
        })
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach( watcher => {
            watcher.update();
        })
    }
}