export function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key)
}

// 工具函数
export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable, // 不传，默认不可枚举
        writable: true,
        configurable: true
    })
}

// 是否是有效的数组下标
export function isValidArrayIndex(val) {
    const n = parseFloat(String(val))
    return n >= 0 && Math.floor(n) === n && isFinite(n) // 且非Infinity
}

export function isUndef(v) {
    return v === undefined || v === null
}
export function isDef(val) {
    return val !== undefined && val !== null
}

export function isTrue(v) {
    return v === true
}

export function isPrimitive(value) {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

export function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}
