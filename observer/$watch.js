import Watcher from "./watcher"

/**
 * vm.$watch(exporFn, cb, options)
 * expOrFn-string | Function 表达式或computed函数
 * 例如： const unwatch = vm.$watch('a.b.c', (newVal, oldVal) => {
 * }, {
 *      deep: true,
 *      immediate: true
 * })
 * 取消观察
 * unwatch()
 * 
 * 返回一个取消观察函数，用来停止触发回调
 */

export function watch (expOrFn, cb, options) {
    const vm = this
    options = options || {}
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
        cb.call(vm, watcher.value)
    }
    return function unwatchFn() {
        watcher.teardown()
    }
}
