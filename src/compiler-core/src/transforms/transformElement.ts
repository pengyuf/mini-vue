import { createVNodeCall, NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformElement(node: any, context: any) {
    if (node.type == NodeTypes.ELEMENT) {

        return () => {

            const vnodeTag = `'${node.tag}'`
            let vnodeProps
            const children = node.children
            let vnodeChildren = children[0]

            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren)
        }
    }
}