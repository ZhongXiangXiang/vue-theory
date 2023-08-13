import Dep from './dep.js'
import { arrayMethods } from './array.js'
import { def, isObject, hasOwn } from '../utils.js'
import set from './$set.js'
import del from './$delete.js'

// 有些浏览器不支持__proto__访问原型
// __proto__是否可用
const hasProto = '__proto__' in {}
const arrsyKeys = Object.getOwnPropertyNames(arrayMethods) // 不包含原型上的键

// 递归侦测所有Key
class Observer {
    constructor (value) {
        this.value = value
        // Array的依赖存放在Observer实例上，因为要在getter和拦截器中都可以访问到依赖
        this.dep = new Dep()
        // 在对象数据上增加一个不可枚举的属性__ob__,值是Observer实例，后续就可以通过__ob__属性拿到Observer实例，还可用于标记value是否已转为响应式数据
        def(value, '__ob__', this)

        if (Array.isArray(value)) {
            // 拦截器覆盖被转成响应式数据的原型
            const augment = hasProto ? protoAugment : copyAugment
            augment(value, arrayMethods, arrsyKeys)
            // 侦测数组中的(对象)元素变化
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }

    observeArray(items) {
        for (let i = 0; i < items.length; i++) {
            observe(items[i])
        }
    }
}

// 定义一个响应式数据
export function defineReactive(data, key, val) {
    // 递归子属性
    // if (typeof val === 'object') {
    //     new Observer(val)
    // }
    let childOb = observe(val) // 获取数组Observe实例
    let dep = new Dep() // 用来保存key的依赖(用到了数据的地方，如模板中、watch)
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            // 收集依赖
            dep.depend()

            // 收集Array的依赖,例如访问this.list =[1,2,3], 会走getter
            if (childOb) {
                childOb.dep.depend()
            }

            return val
        },
        set(newVal) {
            if (newVal === val) {
                return
            }
            val = newVal

            // 若重新设置的是新对象，对设置的新对象转换为响应式，并更新childOb为新的Observe实例
            childOb = observe(newVal)

            // 数据改变时，通知所有用到数据的地方-依赖
            dep.notify()
        }
    })
}

function protoAugment(target, src, keys) {
    // 拦截器覆盖被转成响应式数据的原型
    target.__proto__ = src
}

function copyAugment(target, src, keys) {
    // 不支持__proto__属性的浏览器
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        def(target, key, src[key]) // 拦截器的方法直接添加到value的属性上
    }
}

// 为value创建一个Observer实例
function observe(value, asRootData) {
    if (!isObject(value)) {
        return
    }
    let ob
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        // 已经有了Observer实例，直接返回
        ob = value.__ob__
    } else {
        ob = new Observer(value)
    }
    return ob
}

export {
    set,
    del
}
