class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        // 将真实dom放到文档碎片中
        let fragment = this.node2Fragment(this.el);
        // 开始编译
        this.compile(fragment);
        //重新返回到dom中
        this.el.appendChild(fragment);
    }
    //辅助方法
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isDirective(name) {
        return name.includes('v-')
    }

    //核心方法
    node2Fragment(node) {
        let firstChild;
        let fragment = document.createDocumentFragment();
        while(firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    compileElement(node) {
        let attrs = node.attributes;
        debugger
        Array.from(attrs).forEach( attr => {
            let name = attr.name;   // v-model
            if (this.isDirective(name)) { // 判断 v-
                let expr = attr.value;  // message
                let [, type] = name.split('-');
                compileUtil[type](this.vm, expr, node);
            }
        })
    }
    compileText(node) {
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) {
            compileUtil['text'](this.vm, expr, node);
        }
    }
    compile(node) {
        let childNodes = node.childNodes;
        Array.from(childNodes).forEach( node => {
            let type = node.nodeType;
            if (type == 1) {
                //元素节点
                this.compileElement(node);
                this.compile(node)
            }else {
                // 文本节点
                this.compileText(node);
            }
        })
    }
}

compileUtil = {
    getValue(vm, expr) {
        // expr 可能是 message.a.b.c;
        expr = expr.split('.');
        return expr.reduce((prev, next) => {
            return prev[next];
        },vm.$data)
    },
    getTextValue(vm, expr) {
        // expr 可能有多个 {{message}}  {{message1}}  {{message2}}
        // 把每个{{...}} 替换掉
        let val = expr.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
            return this.getValue(vm, arg[1]);
        })
        return val;
    },
    setValue(vm, expr, value) {
        expr = expr.split('.');
        expr.reduce((prev, next, currentIndex) => {
            if (currentIndex == expr.length -1 ) {
                return prev[next] = value;
            }
            return prev[next];
        }, vm.$data)
    },
    model(vm, expr, node) {
        let updaterFn = this.updater.modelUpdater;
        let value = this.getValue(vm, expr);
        node.addEventListener('input', (e) => {
            let value = e.target.value;
           this.setValue(vm, expr, value);
        })
        new Watcher(vm, expr, (newValue) => {
            updaterFn && updaterFn(node, newValue);
        })
        updaterFn && updaterFn(node, value);
    },
    text(vm, expr, node) {
        let updaterFn = this.updater.textUpdater;
        let value = this.getTextValue(vm, expr);
        expr.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
            debugger;
            new Watcher(vm, arg[1], (newValue) => {
                updaterFn && updaterFn(node, this.getTextValue(vm, expr));
            })
        })
        updaterFn && updaterFn(node, value)
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value;
        },
        textUpdater(node, value) {
            node.textContent = value;
        }
    }
}