
// 观察者的目的， 就是给需要变化的那个元素增加一个观察者
// 新值老值进行比对 如果发生变化 就调用更新方法
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 存一下旧值
        this.value = this.get();
    }
    getValue(vm, expr) {
        // 因为expr可能是长message.a.b.c，这种形式, 所以要进行收敛处理
        let exprArr = expr.split('.');
        return exprArr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    }
    get() {
        Dep.target = this;
        let value = this.getValue(this.vm, this.expr);
        Dep.target = null;
        return value;
    }
    // 对外暴露的方法, 新值旧值不相等时触发回调
    update() {
        let newValue = this.getValue(this.vm, this.expr);
        let oldValue = this.value;
        if(newValue != oldValue) {
            this.cb(newValue);
        }
    }
}