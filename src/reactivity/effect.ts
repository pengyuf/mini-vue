let activeEffect // 一个全局变量，在track中收集到targetMap中
let targetMap = new Map()  // 存储effect的容器

class ReactiveEffect {
    private _fn: any;
    constructor(fn) {
        this._fn = fn
    }
    run() {
        activeEffect = this
        this._fn()
    }
}

export function effect(fn) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
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
    dep.add(activeEffect)
}

// 触发依赖
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    for (const effect of dep) {
        effect.run()
    }
}