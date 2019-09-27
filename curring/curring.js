
// 柯里化通用函数实现
function add(a, b, c, d, e) {
  return a + b + c + d + e;
}
function curring(fn, arr = []) {
    let len = fn.length;
    debugger
    return function (...args) {
        arr = [...arr, ...args];
        if (arr.length < len) {
            return curring(fn, arr);
        }else {
            return fn(...arr);
        }
    }
}

let r = curring(add)(1, 2)(3)(4, 5, 6);
console.log(r);



// 反柯里化
function unCurring(fn) {
    return function() {
        let [that, ...arg] = [...arguments];
        fn.apply(that, arg);
    }
}