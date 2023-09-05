import { NodeTypes } from "./ast"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
    const context = createTransfromContext(root, options)
    // 查找节点-深度优先搜索
    traverseNode(root, context)
    createRootCodegen(root)
    root.helpers = [...context.helpers.keys()]
    // 修改
}

function createRootCodegen(root) {
    root.codegenNode = root.children[0]
}

function createTransfromContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper: (key) => {
            context.helpers.set(key, 1)
        }
    }
    return context
}

function traverseNode(node: any, context) {

    const nodeTransforms = context.nodeTransforms
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        transform(node)
    }


    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context)
            break;
        default:
            break;
    }

}

function traverseChildren(node: any, context) {
    const children = node.children
    for (let i = 0; i < children.length; i++) {
        const node = children[i]
        traverseNode(node, context)
    }

}