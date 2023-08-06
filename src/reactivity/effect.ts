class ReactiveEffect {
    private _fn: any
    deps = []
    active = true
    constructor(fn, public scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }
    run() {
        activeEffect = this
        return this._fn()
    }
    stop() {
        if (this.active) {
            clearupEffect(this)
            this.active = false
        }
    }
}

function clearupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
}

export function stop(runner) {
    runner.effect.stop()
}

let activeEffect
export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

let targetMap = new Map()
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
    if (!activeEffect) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
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