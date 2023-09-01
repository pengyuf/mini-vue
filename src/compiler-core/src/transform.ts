export function transform(root, options) {
    const context = createTransfromContext(root, options)
    // 查找节点-深度优先搜索
    traverseNode(root, context)
    // 修改

}

function createTransfromContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || []
    }
    return context
}

function traverseNode(node: any, context) {

    const nodeTransforms = context.nodeTransforms
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node)
    }

    traverseChildren(node, context)

}

function traverseChildren(node: any, context) {
    const children = node.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i]
            traverseNode(node, context)
        }
    }
}