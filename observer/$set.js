
/**
 * const unwatch = vm.$set(target, key, value)
 * target-Object | Array, 不能是Vue实例或Vue实例的根数据对象
 * 返回unwatch???
 * 
 */

import { defineReactive } from "./index"
import { isValidArrayIndex } from "../utils"

// import { set } from "vue/src/core/observer";
export function set(target, key, val) {
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key)
        target.splice(key, 1, val) // 数组拦截器会侦测到target发生了变化，并自动把新增的val转换成响应式
        return val
    }

    // key已存在于target中
    if (key in target && !(key in Object.prototype)) {
        target[key] = val // 直接改数据，会触发setter
        return val
    }

    // 新增属性
    const ob = target.__ob__
    // target不能是Vue实例或Vue实例的根数据对象this.$data
    if (target._isVue || (ob &&  ob.vmCount)) {
        process.env.NODE_ENV !== 'production' && warn(
            'Avoid adding reactive properties to a Vue instance or its root $data ' +
            'at runtime - declare it upfront in the data option.'
        )
        return val
    }

    // target不是响应式
    if (!ob) {
        target[val] = val
        return val
    }
    // 响应式数据上新增属性，将新属性转换成getter/setter形式
    defineReactive(ob.value, key, val)
    // 向target的依赖触发变化通知，可以侦测到新增了属性
    ob.dep.notify()
    return val

}
