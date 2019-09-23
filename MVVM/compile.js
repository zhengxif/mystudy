class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        //创建虚拟节点
        let fragement = this.node2Fragement(this.el);
        //编译
        this.compile(fragement);
        // 返回到dom
        this.el.appendChild(fragement);
    }  
    
    /*辅助方法*/
    isElementNode(node) {
        return node.nodeType === 1;
    }
    isDirective(attrName) {
        return attrName.includes('v-');
    }
    /*核心方法*/
    compileElement(node) {
        // 拿到所有节点属性
        let attrs = node.attributes;
        Array.from(attrs).forEach( attr => {
            let attrName = attr.name;
            // 判断属性是否带有 v-
            if (this.isDirective(attrName)) {
                // 属性表达式
                let expr = attr.value;
                let [, type] = attrName.split('-');
                // 根据v- 绑定类型，应用对应工具方法渲染value
                CompileUtil[type](node, this.vm, expr);
            }
        })
    }
    compileText(node) {
        let expr = node.textContent; // //{{message}}
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) {
            CompileUtil['text'](node, this.vm, expr);
        }
    }
    compile(fragement) {
        // 找出所有子节点
        let childNodes = fragement.childNodes;
        // 遍历所有子节点
        Array.from(childNodes).forEach( node => {
            // 判断节点类型
            if (this.isElementNode(node)) {
                // 元素节点
                this.compileElement(node);
                // 递归编译
                this.compile(node);
            } else {
                // 文本节点
                this.compileText(node);
            }
        })
    }
    node2Fragement(el) {
        let fragement = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild) {
            fragement.appendChild(firstChild);
        }
        return fragement;
    }
}

// 渲染节点value的工具方法
CompileUtil = {
    getValue(vm, expr) {
        let exprArr = expr.split('.');
        return exprArr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    getTextValue(vm, expr) {
        let val = expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
            return this.getValue(vm, args[1]);
        })
        return val;
    },
    setValue(vm, expr, newValue) {
        expr = expr.split('.');
        expr.reduce((prev, next, currentIndex) => {
            if (currentIndex == expr.length -1) {
                return prev[next] = newValue;
            }
            return prev[next];
        }, vm.$data) 
    },
    model (node, vm, expr) {
        // expr可能是长message.a.b.c，这种形式, 所以要进行收敛处理
        let value = this.getValue(vm, expr);
        // 绑定事件
        node.addEventListener('input', (e) => {
            let newValue = e.target.value;
            this.setValue(vm, expr, newValue);
        })
        // 对每个属性expr增加一个watcher
        new Watcher(vm, expr, (newValue) => {
            this.updater.updaterModel(node, newValue);
        })
        this.updater.updaterModel(node, value);
    },
    text(node, vm, expr) {
        // expr可能为多个： {{message}} {{a}}, 所以依次赋值
        let value = this.getTextValue(vm, expr);
        // 对每个属性增加一个watcher
        expr.replace(/\{\{([^}]+)\}\}/g, (...args)=> {
            new Watcher(vm, args[1], (newValue) => {
                this.updater.updaterText(node, this.getTextValue(vm, expr));
            })
        })
        this.updater.updaterText(node, value);
    },
    updater: {
        updaterModel(node, value) {
            node.value = value
        },
        updaterText(node, value) {
            node.textContent = value;
        }
    }
}