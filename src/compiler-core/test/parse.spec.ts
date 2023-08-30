import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"

describe("Parse", () => {
    describe('interpolation', () => {
        // 插值
        test('simple interpolation', () => {
            const ast = baseParse("{{message}}")
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.INTERPOLATION,
                content: {
                    type: NodeTypes.SIMPLE_EXPRESSION,
                    content: "message"
                }
            })
        })
    })

    describe('element', () => {
        // elements
        test('simple element', () => {
            const ast = baseParse("<div></div>")
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: 'div',
                children: []
            })
        })
    })


    describe('text', () => {
        // elements
        test('simple text', () => {
            const ast = baseParse("some text")
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content: 'some text'
            })
        })
    })


    test('hello wrold', () => {
        const ast = baseParse('<p>hi,{{message}}</p>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'p',
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: 'hi,'
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        })
    })


    test('nested element', () => {
        const ast = baseParse('<div><p>hi</p>{{message}}</div>')
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'p',
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: 'hi'
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        })
    })


    test('throw error', () => {
        expect(() => {
            baseParse('<div><span></div>')
        }).toThrow('缺少结束标签:span')
    })

})