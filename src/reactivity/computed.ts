import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    private _dirty: boolean = true;
    private _value: any;
    private _effect: any;
    constructor(getter) {
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }
    get value() {
        // 定义一个_dirty，锁住_getter的执行
        if (this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}