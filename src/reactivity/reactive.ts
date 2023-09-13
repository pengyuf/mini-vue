import { track, trigger } from "./effect"

export function reactive(target){
    return new Proxy(target,{
        get:function(target,key){
            const result = Reflect.get(target,key)
            track(target,key)
            return result
        },
        set:function(target,key,value){
            const result = Reflect.set(target,key,value)
            trigger(target,key)
            return result
        }
    })
}