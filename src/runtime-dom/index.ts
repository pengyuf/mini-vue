import { createRenderer } from '../runtime-core'

function createElement(type) {
    return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
    // onClick : 判断是否是一个事件
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        // 注册事件
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, nextVal)
    } else {
        if (nextVal === null || nextVal === undefined) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextVal)
        }
    }
}

function insert(el, parent) {
    parent.append(el)
}


const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert
})

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'