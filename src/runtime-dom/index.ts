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

function insert(child, parent, anchor) {
    // anchor = null,在尾部添加
    parent.insertBefore(child, anchor || null)
}


function remove(child) {
    const parent = child.parentNode
    if (parent) {
        parent.removeChild(child)
    }
}

function setElementText(el, text) {
    el.textContent = text
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'