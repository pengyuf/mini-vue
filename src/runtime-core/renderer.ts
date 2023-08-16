import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理component
        processComponent(vnode, container)
    }
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode, container: any) {
    const { proxy } = instance
    // 调用render，改变render的this
    const subTree = instance.render.call(proxy)

    patch(subTree, container)

    initialVNode.el = subTree.el
}

function processElement(vnode: any, container: any) {
    //  初始化
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = (vnode.el = document.createElement(vnode.type))

    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el)
    }

    const { props } = vnode
    for (const key in props) {
        const val = props[key]
        // onClick : 判断是否是一个事件
        const isOn = (key: string) => /^on[A-Z]/.test(key)
        if (isOn(key)) {
            // 注册事件
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }

    container.append(el)
}

function mountChildren(vnode: any, container: any) {
    vnode.forEach(v => {
        patch(v, container)
    })
}

