import { reactive } from "../reactive"
import {effect} from "../effect"

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({ age: 1 })
        let newAge
        effect(() => { newAge = user.age + 1 })
        expect(newAge).toBe(2)
        user.age++
        expect(newAge).toBe(3)
    })
})