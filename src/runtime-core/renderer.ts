import { effect } from "../reactivity"
import { EMPTY_OBJ, isObject } from "../shared/index"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options

    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }

    /**
     * 
     * @param n1 老的
     * @param n2 新的
     * @param container 
     * @param parentComponent 
     */
    function patch(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag, type } = n2

        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 处理component
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
                break;
        }
    }

    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor)
    }

    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance: any, initialVNode, container: any, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                // 初始化
                const { proxy } = instance
                // 调用render，改变render的this
                const subTree = (instance.subTree = instance.render.call(proxy))

                patch(null, subTree, container, instance, anchor)

                initialVNode.el = subTree.el

                instance.isMounted = true
            } else {
                // 更新
                const { proxy } = instance
                // 调用render，改变render的this
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree // 旧的subTree
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)
            }
        })
    }

    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            //  初始化
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n1.props || EMPTY_OBJ
        const el = (n2.el = n1.el)

        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }


    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag
        const { shapeFlag } = n2
        const c1 = n1.children
        const c2 = n2.children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // new is text
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 清空children
                unmountChildren(n1.children)
            }
            if (c1 !== c2) {
                // 设置text
                hostSetElementText(container, c2)
            }
        } else {
            // new is array
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let l2 = c2.length
        let i = 0
        let e1 = c1.length - 1
        let e2 = l2 - 1


        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key
        }

        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSomeVNodeType(n1, n2)) { // 对比节点是否相同
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            i++
        }

        // 右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSomeVNodeType(n1, n2)) { // 对比节点是否相同
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            e1--
            e2--
        }

        if (i > e1) {
            // 新的比老的长，需要创建元素
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    // 循环添加
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            // 新的比老的短，需要删除元素
            while (i <= e1) {
                hostRemove(c1[i].el)
            }
        } else {
            // 乱序

        }
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            hostRemove(el)
        }
    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if (prevProp !== nextProp) {
                    // 修改
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

    function mountElement(vnode: any, container: any, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type))

        const { children, shapeFlag } = vnode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent, anchor)
        }

        const { props } = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null, val)
        }

        // container.append(el)
        hostInsert(el, container, anchor)
    }

    function mountChildren(children: any, container: any, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor)
        })
    }

    function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    function processText(n1, n2: any, container: any) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    return {
        createApp: createAppAPI(render)
    }
}