import { def } from '../utils'

// 拦截器
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
    // 缓存原始方法
    const original = arrayProto[method]
    // Object.defineProperty(arrayMethods, method, {
    //     value: function mutator(...args) {
    //         // 拦截器是对原型的一种封装，访问到的this是当前被操作的数组，如arr.push(1) this是arr
    //         const ob = this.__ob__ // 获取数组的Observer实例
    //         // 数组发生变化，向依赖(watcher)发送通知
    //         ob.dep.notify()
    //         return original.apply(this, args)
    //     },
    //     enumerable: false,
    //     writable: true,
    //     configurable: true
    // })
    def(arrayMethods, method, function mutator(...args) {
        const result = original.apply(this, args)
        const ob = this.__ob__
        // 对数组新增的元素进行侦测
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
        
            case 'splice':
                inserted(args.slice(2))
                break;
        }
        if (inserted) {
            ob.observeArray(inserted)
        }
        ob.dep.notify()
        return result
    })
}) 