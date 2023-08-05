import { extend } from "../shared";

class ReactiveEffect {
    private _fn: any;
    deps = []
    // 是否执行stop的标志位，当执行完一次stop后，不再执行清空操作。优化性能。
    active = true
    onStop?: () => void
    constructor(fn, public scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }

    run() {
        if (!this.active) {
            // 当处于stop状态时，再次执行fn，fn会触发get操作，但此时shouldTrack已经置为false，在track中不会在收集
            return this._fn()
        }

        activeEffect = this
        // 在非stop状态时，track中都会收集effect
        shouldTrack = true
        // 返回_fn的返回值
        const result = this._fn()
        shouldTrack = false
        return result
    }

    stop() {
        if (this.active) {
            clearEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function clearEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

let activeEffect
let shouldTrack
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)

    // _effect.onStop = options.onStop
    extend(_effect, options)
    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}

const targetMap = new Map()
export function track(target, key) {
    if (!isTracking()) return
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    if(dep.has(activeEffect))return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

function isTracking() {
    return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

