import { createVNode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 所有的操作都是基于vnode，所以先要将component转为vnode
                const vnode = createVNode(rootComponent)

                render(vnode, rootContainer)
            }
        }
    }
}