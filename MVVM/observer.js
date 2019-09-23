class Observer {
    constructor(data) {
        this.observer(data);
    }
    observer(data) {
        if (typeof data != 'object' || !data) {
            return
        }
        //开始劫持, 针对每个属性
        Object.keys(data).forEach( key => {
            //定义响应式
            this.defineReactive(data, key, data[key]);
            //递归
            this.observer(data[key]);
        })
    }
    defineReactive(obj, key, value) {
        let dep = new Dep();
        let that = this;
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target);
                return value
            },
            set(newValue) {
               if (newValue != value) {
                   that.observer(newValue);
                    value = newValue;
                    dep.notify()
               }
            }
        })
    }
}

class Dep {
    constructor() {
        // 订阅的数组
        this.subs = [];
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach((watcher) => {
            watcher.update();
        })
    }
}