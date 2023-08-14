import { isObject } from "../shared/index"
import { mutableHandler, readonlyHandler, shallowReadonlyHandler } from "./baseHandlers"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHandler)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandler)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler)
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value){
    return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw: any, baseHandler) {
    if(!isObject(raw)){
        console.warn(`${raw} 必须是对象`)
        return raw
    }
    return new Proxy(raw, baseHandler)
}