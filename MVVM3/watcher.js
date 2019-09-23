class Watcher {
    constructor(vm, expr ,cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        // 获取老值
        this.value = this.get();
    }
    getValue(vm, expr) {
        // expr 可能为message、message.a.b.c
        expr = expr.split('.');
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    }
    get() {
        Dep.target = this;
        let value = this.getValue(this.vm, this.expr);
        Dep.target = null;
        return value;
    }
    update() {
        let oldValue = this.value;
        let newValue = this.getValue(this.vm, this.expr);
        if (newValue != oldValue) {
            this.cb(newValue);
        }
    }
}

