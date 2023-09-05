import { NodeTypes } from "../ast";

export function transformExpression(node) {
    if (node.type == NodeTypes.INTERPOLATION) {
        node.content = processExpresion(node.content)
    }
}

function processExpresion(node: any) {
    node.content = `_ctx.${node.content}`
    return node
}