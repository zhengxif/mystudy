class MVVM {
    constructor(options) {
        // 元素根节点
        this.$el = options.el;
        this.$data = options.data;
        if (this.$el) {
            //数据劫持
            new Observer(this.$data);
            this.proxy(this.$data);
            //开始编译
            new Compile(this.$el, this)
        }
    }
    proxy(data) {
        Object.keys(data).forEach( key => {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newValue) {
                    data[key] = newValue;
                }
            })
        })
    }
}