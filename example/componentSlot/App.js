import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    render() {
        const app = h('div', {}, 'App')
        const foo = h(Foo, {},
            {
                header: ({ age }) => [h('p', {}, 'header' + age), createTextVNode('哈哈哈')],
                // header: ({ age }) => h('p', {}, 'header' + age),
                footer: () => h('p', {}, 'footer')
            })
        // const foo = h(Foo, {}, h('p', {}, '123'))
        return h('div',
            {},
            [app, foo]
        )
    },
    setup() {
        return {
        }
    }
}