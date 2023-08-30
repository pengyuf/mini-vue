import { NodeTypes } from "./ast"

export function baseParse(content: string) {

    const context = createParseContext(content)

    return createRoot(parseChildren(context, []))
}


function parseChildren(context: any, ancestors) {
    const nodes: any[] = []

    while (!isEnd(context, ancestors)) {
        let node
        const s = context.source
        if (s.startsWith('{{')) {
            //  解析插值
            node = parseInterpolation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                // 解析element
                node = parseElement(context, ancestors)
            }
        }

        if (!node) {
            // 默认当做text处理
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}


function isEnd(context, ancestors) {
    const s = context.source

    if (s.startsWith('</')) {
        for (let i = ancestors.length-1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (startsWithEndTagOpen(s,tag)) {
                return true
            }
        }
    }

    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }

    return !s
}


function parseText(context: any) {
    let endIndex = context.source.length
    let endTokens = ["<", "{{"]

    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }



    const content = parseTextData(context, endIndex)
    console.log('content------------', content)
    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context, length) {
    const content = context.source.slice(0, length)
    advanceBy(context, length)
    return content
}

const enum TagType {
    Start,
    End
}

function parseElement(context: any, ancestors) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`缺少结束标签:${element.tag}`)
    }
    return element
}


function startsWithEndTagOpen(source, tag) {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag(context: any, type: TagType) {
    // 解析tag
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    // 删除处理完的代码
    advanceBy(context, match[0].length)
    advanceBy(context, 1)
    if (type === TagType.End) return
    return {
        type: NodeTypes.ELEMENT,
        tag
    }
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

    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim()

    advanceBy(context, closeDelimiter.length)

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



