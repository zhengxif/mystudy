class Compiler {
    constructor(el, vm) {
        this.$el = this.isElementNode(el) ? el : document.getElementById(el);
        this.vm = vm;

        // 获取所有的dom节点
        let fragment = this.node2fragment(this.$el);
        // 开始编译
        this.compile(fragment);
        // 查到真实dom
        this.$el.appendChild(fragment);

    }
    // 辅助函数
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isDirective(name) {
        return name.includes('v-')
    }

    // 核心方法
    node2fragment(node) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    compileElement(node) {
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            let name = attr.name;
            if (this.isDirective(name)) {
                // 表示v-
                let expr = attr.value;
                let [, type] = name.split('-');
                compileUtil[type](this.vm, node, expr);
            }
        })
    }
    compileText(node) {
        let expr = node.textContent;
        let regExp = /\{\{([^}]+)\}\}/g;
        if (regExp.test(expr)) {
            compileUtil['text'](this.vm, node, expr);
        }
    }
    compile(node) {
        let childNodes = node.childNodes;
        Array.from(childNodes).forEach(node => {
            let nodeType = node.nodeType;
            if (nodeType === 1) {
                // 元素节点
                this.compileElement(node);
                this.compile(node);
            } else {
                // 文本节点
                this.compileText(node);
            }
        })
    }
}

compileUtil = {
    getValue(vm, expr) {
        // expr 可能为message、message.a.b.c
        expr = expr.split('.');
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    },
    getValueText(vm, expr) {
        // expr 可能是多个 {{message}} {{a}}
        return expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
            return this.getValue(vm, args[1]);
        })
    },
    setValue(vm, expr, value) {
        expr = expr.split('.');
        expr.reduce((prev, next, currentIndex) => {
            if(currentIndex == expr.length - 1) {
                prev[next] = value;
            }
            return prev[next];
        }, vm.$data);
    },
    model(vm, node, expr) {
        let updateFn = this.update.updateModel;
        let value = this.getValue(vm, expr);
        node.addEventListener('input', (e) => {
            debugger
            let value = e.target.value;
            this.setValue(vm, expr, value);
        })
        new Watcher(vm, expr, (newValue) => {
            updateFn && updateFn(node, newValue);
        })
        updateFn && updateFn(node, value);
    },
    text(vm, node, expr) {
        let updateFn = this.update.updateText;
        let value = this.getValueText(vm, expr);
        expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
            new Watcher(vm, args[1], (newValue) => {
                updateFn && updateFn(node, this.getValueText(vm, expr));
            })
        })
        updateFn && updateFn(node, value)
    },
    update: {
        updateModel(node, value) {
            node.value = value;
        },
        updateText(node, value) {
            node.textContent = value;
        }
    }
}