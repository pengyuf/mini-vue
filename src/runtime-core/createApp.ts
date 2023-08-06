import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转成vonde，在做逻辑处理
            const vnode = createVNode(rootComponent)
        
            render(vnode,rootContainer)
        }
    }
}