# mini-vue

## 实现effect、reactive、依赖收集、依赖触发

### 实现effect
1. 创建ReactiveEffect实例，传入fn
2. 立即执行实例的run方法

### reactive
直接返回一个proxy对象，在get时收集依赖，在set时触发依赖

### 依赖收集
1. 在创建完响应式数据后，执行effect函数
2. effect会创建一个ReactiveEffect实例，并立即执行实例的run方法。
3. run方法会将当前的effect实例保存到一个全局变量(activeEffect)，并立即执行effect传入的fn，触发get。
4. get，会执行track方法。将activeEffect保存到dep中

### 依赖触发
1. 遍历所有的effect
2. 重新执行effect的run方法

## 实现effect返回runner
effect执行后，返回一个fn(runner)，runner执行后返回effect传入的fn的值。


1. effect直接返回_effect.run.bind(_effect)。_effect.run存在this指向问题，通过bind指定run函数中的this为当前的_effect。
2. 在run函数中，return this._fn()

## 实现effect的scheduler
effect传入第二个可选的参数对象，参数对象包含一个scheduler。scheduler函数存在时，当响应式对象触发set时，不在执行effect传入的函数，转而执行传入的scheduler。

1. effect，需要接受第二个参数
2. _effect保存传入的scheduler
3. 在trigger中判断_effect是否有scheduler，有就执行scheduler，反之，执行run

## 实现effect的stop
调用stop后，当响应式对象发生改变时，不再执行effect传入的fn。

1. 将stop封装到ReactiveEffect中
2. 在stop函数中直接调用传入runner的effect的stop。所有需要再effect首次执行时，将当前的effect挂载到runner.effect上
3. 同时为了deps可以删除指定的effect，effect需要可以指向包含它的deps。在track函数中，创建activeEffect的deps数组，保存包含它的dep。
4. 在3创建的deps数组中，循环执行delete操作

## 实现readonly
只能读取数据，不能修改数据。
因为在set中不需要触发依赖，所有在get中也不需要进行依赖收集

1. 将reactive()中的，track和trigger删除
2. 使用TDD思想，重构代码