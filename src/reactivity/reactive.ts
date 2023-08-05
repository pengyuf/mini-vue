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

function createActiveObject(raw: any, baseHandler) {
    return new Proxy(raw, baseHandler)
}