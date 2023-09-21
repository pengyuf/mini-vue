import { reactive } from "../reactive"
import { effect,stop } from "../effect"

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({ age: 1 })
        let newAge
        effect(() => { newAge = user.age + 1 })
        expect(newAge).toBe(2)
        user.age++
        expect(newAge).toBe(3)
    })

    it('runner', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'runner'
        })
        expect(foo).toBe(11)
        const data = runner()
        expect(foo).toBe(12)
        expect(data).toBe('runner')
    })

    it('scheduler',()=>{
        let dummy
        let run:any
        const scheduler = jest.fn(()=>{
            run = runner
        })
        const obj = reactive({foo:1})
        const runner = effect(()=>{
            dummy = obj.foo
        },{
            scheduler
        })
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        run()
        expect(dummy).toBe(2)
    })

    it('stop',()=>{
        let dummy
        const obj = reactive({foo:1})
        const runner = effect(()=>{
            dummy = obj.foo
        })
        obj.foo = 2
        expect(dummy).toBe(2)
        stop(runner)
        obj.foo = 3
        expect(dummy).toBe(2)
        runner()
        expect(dummy).toBe(3)
    })

    it('onStop',()=>{
        let dummy
        const onStop = jest.fn()
        const obj = reactive({foo:1})
        const runner = effect(()=>{
            dummy = obj.foo
        },{
            onStop
        })
        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })
})