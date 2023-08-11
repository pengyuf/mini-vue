import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        // 处理component
        processComponent(vnode, container)
    }
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)

    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container: any) {
    const subTree = instance.render()

    patch(subTree, container)
}

function processElement(vnode: any, container: any) {
    //  初始化
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type)

    const { children } = vnode
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(children, el)
    }

    const { props } = vnode
    for (const key in props) {
        const val = props[key]
        el.setAttribute(key, val)
    }

    container.append(el)
}

function mountChildren(vnode: any, container: any) {
    vnode.forEach(v => {
        patch(v, container)
    })
}

