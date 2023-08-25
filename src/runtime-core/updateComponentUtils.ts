export function shouldUpdateComponent(preVNode, nextVNode) {

    const { porps: preProps } = preVNode
    const { porps: nextProps } = nextVNode

    for (const key in nextProps) {
        if (preProps[key] !== nextProps[key]) {
            return true
        }
    }
    return false
}