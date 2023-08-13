# vue-theory
本项目是阅读《深入浅出Vue.js》的读书笔记，代码主要是书中讲解的内容，加上自己的理解添加了注释

代码目录根据章节内容大致分为：
- /observer 响应式原理
- /vdom 虚拟DOM渲染原理，主要讲解了patching算法，通过vnode对比生成真实DOM元素
- /compiler 模板编译原理，Vue.js自己提供了模板编译器，先将模板解析成AST，再将AST生成渲染函数，执行渲染函数生成vnode
- /global-api 全局API，如Vue.component, Vue.extend, Vue.nextTick...
- /instance 实例方法，如vm.$on, vm.$emit, vm.$nextTick；及Vue.js的生命周期，实例如何挂载、实例的初始化props, methods, data, computed, watch
