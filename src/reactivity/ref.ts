import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class refImpl {
    private _value: any;
    public dep;
    public __v_isRef = true
    private _rawValue: any;
    constructor(value) {
        // 判断value是否是对象，如果是对象的话，调用reactive，转换为响应式对象
        this._rawValue = value
        this._value = convert(value)
        this.dep = new Set()
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep)
        }
        return this._value
    }
    set value(newValue) {
        // 当传入的是对象时，_value是一个proxy对象，此时比较newValue和_value时，hasChanged一定是true
        // 所有我们需要保存原始传入的值。通过原始传入的值和newValue进行比较
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerEffect(this.dep)
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}


export function ref(value) {
    return new refImpl(value)
}

export function isRef(ref){
    return !!ref.__v_isRef
}

export function unRef(ref){
    return isRef(ref)?ref.value:ref
}