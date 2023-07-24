import { effect } from '../effect'
import { reactive } from '../reactive'

describe("effect", () => {
    it("happy path", () => {
        const user = reactive({ age: 10 })
        let newAge
        effect(() => { newAge = user.age + 1 })
        expect(newAge).toBe(11)

        user.age++
        expect(newAge).toBe(12)
    })

    it("effect return fn(runner)", () => {
        let age = 10
        const runner = effect(() => {
            age++
            return 'runner'
        })
        expect(age).toBe(11)
        const r = runner()
        expect(age).toBe(12)
        expect(r).toBe('runner')

    })
})