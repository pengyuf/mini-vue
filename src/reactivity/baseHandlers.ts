import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readOnlyGet = createGetter(true)
const shallowReadOnlyGet = createGetter(true,true)

function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function get(target, key) {
        if (key == ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key == ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        const res = Reflect.get(target, key)

        if (isShallowReadonly) {
            return res
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        if (!isReadonly) {
            // 依赖收集
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)

        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readOnlyGet,
    set(target, key, value) {
        console.warn(`${key} 是readonly`)
        return true
    }
}

export const shallowReadonlyHandler = extend({},readonlyHandler,{
    get:shallowReadOnlyGet
})