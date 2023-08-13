import { handleError } from "vue/src/core/util"
import { isObject } from "../utils"

/**
 * 用法：vm.$watch('a.b.c', (value, oldValue) => {}) 或 模板中
 * 
 * 当expOrFn是一个函数时，函数中使用了多个数据，此时watcher就要收集多个Dep了，如：
 * this.$watch(function() {
 *      return this.name + this.age // get()中会访问name，触发name的getter, 在getter中的Dep收集该watcher；也会访问age，触发age的getter，Dep收集该watcher
 * }, function (newValue, oldValue) {
 *      console.log(newValue)
 * })
 */

export default class Watcher {
    constructor(vm, expOrFn, cb, options) {
        this.vm = vm

        // 每当创建watcher实例时，都将watcher实例添加到vm._watchers中
        vm._watchers.push(this)

        if (options) {
            this.deep = !!options.deep
        } else {
            this.deep = false
        }

        // 记录自己订阅了谁，即被哪些Dep收集过
        this.deps = []
        this.depIds = new Set()
        // expOrFn参数支持函数
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            // 执行this.getter(),就可以读取data.a.b.c的内容
            this.getter = parsePath(expOrFn)
        }
        this.cb = cb

        // 用于实现计算属性的相关功能
        // if (options) {
        //     this.lazy = !!options.lazy
        // } else {
        //     this.lazy = false
        // }
        // this.dirty = this.lazy
        
        // this.value = this.lazy ? undefined : this.get()

        // 2.5.17版本
        if (options) {
            this.computed = !!options.computed
        } else {
            this.computed = false
        }
        this.dirty = this.computed
        if (this.computed) {
            this.value = undefined
            this.dep = new Dep() // 计算属性的依赖列表
        } else {
            this.value = this.get()
        }

    }

    // 用于实现计算属性的相关功能
    evaluate() {
        this.value = this.get() // get()重新调用计算属性getter，重新计算
        this.dirty = false
    }
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

    get() {
        window.target = this
        let value = this.getter.call(this.vm, this.vm) // 这里会触发getter，收集依赖dep.depend()
        // deep: true, 在window.target = undefined之前处理deep逻辑, 触发子值的收集依赖（当前watcher）
        if (this.deep) {
            traverse(value)
        }
        window.target = undefined // 只在构造函数中第一次调用时收集完依赖，然后置空，后续继续访问不会再次收集依赖？？？-》增加addDep，不会重复收集
        return value
    }

    // getter中dep.depend()时会触发该函数
    addDep(dep) {
        const id = dep.id
        if (!this.depIds.has(id)) { // 避免重复订阅
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this) // 把Watcher实例加入dep中，收集依赖
        }
    }

    update() {
        // 2.5.17版本
        if (this.computed) {
            if (this.dep.subs.length === 0) {
                this.dirty = true
            } else {
                this.getAndInvoke(() => {
                    this.dep.notify()
                })
            }
        }

        const oldValue = this.value
        this.value = this.get() // 再次访问，会触发再次收集依赖，去重？？
        this.cb.call(this.vm, this.value, oldValue)
    }

    // 让所有被收集到Dep的Dep列表中把自己移除
    teardown() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
    }

    getAndInvoke(cb) {
        const value = this.get()
        // 计算属性的值改变，才会调用cb，通知组件watcher
        if (value !== this.value || isObject(value) || this.deep) {
            const oldValue = this.value
            this.value = value
            this.dirty = false
            if (this.user) {
                try {
                    cb.call(this.vm, value, oldValue)
                } catch(e) {
                    handleError(e, this.vm, `callback for watcher "${this.expression}"`)
                }
            } else {
                cb.call(this.vm, value, oldValue)
            }
        }
    }
    evaluate() {
        if (this.dirty) {
            this.value = this.get()
            this.dirty = false
        }
        return this.value
    }
    depend() {
        if (this.dep && Dep.target) {
            // 组件watcher（或用户的watch，取决于谁读取了计算属性）添加到计算属性的依赖列表，
            // 只有当计算属性的值真的更新时，才会通知组件重新渲染
            this.dep.depend() 
        }
    }
}

// 解析简单路径
const bailRE = /[^\w.$]/
function parsePath (path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function(obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}

const seenObjects = new Set()
function traverse(val) {
    _traverse(val, seenObjects)
    seenObjects.clear()
}
// 递归value的所有子值，触发它们的收集依赖
function _traverse(val, seen) {
    let i, keys
    const isA = Array.isArray(val)
    // Object.isFrozen()一个对象是冻结的是指它不可扩展，所有属性都是不可配置的，且所有数据属性（即没有getter或setter组件的访问器的属性）都是不可写的
    if ((!isA && !isObject(val)) || Object.isFrozen(val)) { // 属性是non-configurable或non-writable
        return
    }

    if (val.__ob__) {
        const depId = val.__ob__.dep.id
        if (seen.hash(depId)) {
            return
        }
        seen.add(depId)
    }
    if (isA) {
        i = val.length
        while (i--) {
            _traverse(val[i], seen) // 递归数组中的元素，是为了数组元素有可能是对象的场景，进行依赖收集
        }
    } else {
        keys = Object.keys(val)
        i = keys.length
        while (i--) {
            _traverse(val[keys[i]], seen) // 重点在这：val[keys[i]]会触发getter，触发依赖收集dep.depend()，收集相同的当前watcher
        }
    }
}