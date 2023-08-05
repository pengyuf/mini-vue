import { isReadonly, shallowReadonly } from "../reactive"

describe("shallowReeadonly", () => {
    it("happy path", () => {
        const original = { n: { foo: 1 } }
        const wrapped = shallowReadonly(original)

        expect(original).not.toBe(wrapped)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(wrapped.n)).toBe(false)
    })
})