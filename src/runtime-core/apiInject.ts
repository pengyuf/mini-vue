import { getCurrentInstance } from "./component";

export function provide(key, value) {
    // 存
    const curInstance: any = getCurrentInstance()
    if (curInstance) {
        let { provides } = curInstance
        const parentProvides = curInstance.parent.provides
        if (provides === parentProvides) {
            provides = curInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export function inject(key, defaultValue) {
    // 取
    const curInstance: any = getCurrentInstance()
    if (curInstance) {
        const parentProvides = curInstance.parent.provides
        if (key in parentProvides) {
            return parentProvides[key]
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}