import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null

export const App = {
    render() {
        window.self = this
        return h('div',
            {
                id: 'root',
                class: ['red', 'hard'],
                onClick() {
                    console.log('click')
                }
            },
            [h('div', {}, `hi,` + this.msg), h(Foo, {
                onAdd: (a, b) => {
                    console.log('onAdd', a, b)
                }
            })]
            // 'hi,vue'
            // [h('p',{class:'red'},'hi'),h('p',{class:'blue'},'vue')]
        )
    },
    setup() {
        return {
            msg: 'mini vue'
        }
    }
}