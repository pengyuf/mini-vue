import { NodeTypes } from "./ast"

export function baseParse(content: string) {

    const context = createParseContext(content)

    return createRoot(parseChildren(context))
}


function parseChildren(context: any) {
    const nodes: any[] = []
    const node = parseInterpolation(context)
    nodes.push(node)

    return nodes
}

/**
 * @description 解析插值
 */
function parseInterpolation(context) {

    const openDelimiter = '{{'
    const closeDelimiter = '}}'

    // 获取 }} 出现的索引
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    // 删除开始的 {{
    advanceBy(context, openDelimiter.length)

    // 获取插值的内容
    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = context.source.slice(0,rawContentLength)
    const content = rawContent.trim()

    advanceBy(context,rawContentLength + closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}


/**
 * 
 * @param context 
 * @param length 
 * @description 推进（字符串截取）
 */
function advanceBy(context, length) {
    context.source = context.source.slice(length)
}

/**
 * 
 * @param children 
 * @returns 
 * @description 创建根节点
 */
function createRoot(children) {
    return {
        children
    }
}

/**
 * 
 * @param content 传入的内容
 * @description 创建一个全局的上下文对象，基于这个对象进行操作
 */
function createParseContext(content: string) {
    return {
        source: content
    }
}
