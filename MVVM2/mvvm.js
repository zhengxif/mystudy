class MVVM {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        // 数据劫持
        new Observer(this.$data);
        //编译
        new Compile(this.$el, this);
    }
}