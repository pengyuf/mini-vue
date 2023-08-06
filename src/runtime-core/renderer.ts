import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    //  patch
    patch(vnode, container)
}

function patch(vnode, container) {
    // 处理组件
    processComponent(vnode, container)
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    // 通过vnode创建组件实例
    const instance = createComponentInstance(vnode)
    // 处理props、slot等
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
    const subTree = instance.render()
    patch(subTree, container)
}

