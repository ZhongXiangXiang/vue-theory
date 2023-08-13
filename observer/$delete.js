/**
 * vm.$delete(target, key)
 * target - Object | key
 * key - string | number key/index
 */

import { warn } from "vue/src/core/util";
import { isValidArrayIndex, hasOwn } from "../utils";

export function del(target, key) {
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1) // 数组拦截器会侦测到变化，向依赖发送通知
        return
    }

    const ob = target.__ob__
    // target不能是Vue实例或Vue实例的根数据对象this.$data
    if (target._isVue || (ob && ob.vmCount)) {
        process.env.NODE_ENV !== 'production' && warn(
            'Avoid deleting properties on a Vue instance or its root $data ' + 
            '- just set it to null.'
        )
        return
    }

    // 如果key不是target自身的属性，终止程序
    if (!hasOwn(target, key)) {
        return
    }
    delete target[key]

    // 如果不是响应式数据，不需要发送通知
    if (!ob) {
        return
    }

    ob.dep.notify()
}
