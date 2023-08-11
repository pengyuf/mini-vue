import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 所有的操作都是基于vnode，所以先要将component转为vnode
            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)
        }
    }
}