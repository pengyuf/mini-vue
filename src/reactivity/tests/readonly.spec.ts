import { isReadonly, readonly, isProxy } from "../reactive"

describe("readonly", () => {
    it("happy path", () => {
        const original = { foo: 1 }
        const wrapped = readonly(original)

        expect(original).not.toBe(wrapped)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isProxy(wrapped)).toBe(true)
        expect(wrapped.foo).toBe(1)
    })

    it("warn then call set", () => {
        console.warn = jest.fn()

        const user = readonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toBeCalled()
    })

    it("nested readonly", () => {
        const original = {
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
        expect(isReadonly(wrapped.nested)).toBe(true)
    })
})