import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"


// 缓存
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)


function createGetter(isReadonly = false) {
    return function get(target, key) {
        if(key == ReactiveFlags.IS_REACTIVE){
            return !isReadonly
        }else if(key == ReactiveFlags.IS_READONLY){
            return isReadonly
        }
        const result = Reflect.get(target, key)
        if (!isReadonly) {
            track(target, key)
        }
        return result
    }
}

function createSetter() {
    return function set(target, key, value) {
        const result = Reflect.set(target, key, value)
        trigger(target, key)
        return result
    }
}

export const mutableHandler = {
    get,
    set
}

export const readonlyHandler = {
    get: readonlyGet,
    set: function (target, key, value) {
         console.warn(`readonly 不能被set`)
    }
}