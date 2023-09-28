import { mutableHandler, readonlyHandler } from "./baseHandlers"

export const enum ReactiveFlags{
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}

function createActiveObj(target: any,handler) {
    return new Proxy(target, handler)
}

export function reactive(target) {
    return createActiveObj(target,mutableHandler)
}


export function readonly(target) {
    return createActiveObj(target,readonlyHandler)
}

export function isReactive(target){
   return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(target){
   return !!target[ReactiveFlags.IS_READONLY]
}
