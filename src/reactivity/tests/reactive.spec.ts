import { reactive } from "../reactive"

describe('reactive', () => {
    it("happy path", () => {
        let original = { age: 10 }
        let observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.age).toBe(10)
    })
})