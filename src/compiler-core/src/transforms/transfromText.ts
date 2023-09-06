import { NodeTypes } from "../ast";
import { isText } from "../utils";

export function transformText(node) {
    if (node.type == NodeTypes.ELEMENT) {
        return () => {
            const { children } = node
            let curContainer
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!curContainer) {
                                curContainer = children[i] = {
                                    type: NodeTypes.COMPOUND_EXPRESSION,
                                    children: [child]
                                }
                            }
                            curContainer.children.push(' + ')
                            curContainer.children.push(next)
                            children.splice(j, 1)
                            j--
                        } else {
                            curContainer = undefined
                            break
                        }
                    }
                }
            }
        }
    }
}