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
                tag:'div'
            })
        })
    })


    describe('text', () => {
        // elements
        test('simple text', () => {
            const ast = baseParse("some text")
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content:'some text'
            })
        })
    })
    
})