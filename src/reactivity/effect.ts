import { extend } from "../shared";

let activeEffect // 一个全局变量，在track中收集到targetMap中
let targetMap = new Map()  // 存储effect的容器

class ReactiveEffect {
    private _fn: any;
    public scheduler: any;
    deps = []
    active: any = true;
    onStop: any;
    constructor(fn, scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }
    run() {
        activeEffect = this
        const result = this._fn()
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
}

export function stop(runner) {
    runner.effect.stop()
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    extend(_effect, options)
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

// 依赖收集
export function track(target, key) {
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
    if(!activeEffect)return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

// 触发依赖
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
            return
        }
        effect.run()
    }
}