import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  // 确保 install 只执行一次
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue
  
  // 是否有值
  const isDef = v => v !== undefined
  
  // 干嘛用的？
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }
  
  // mixin 钩子到每个组件的生命周期
  Vue.mixin({
    beforeCreate () {
      // 判断组件是否存在 router 对象，该对象只在根组件上有
      if (isDef(this.$options.router)) {
        // 根路由设置为自己
        this._routerRoot = this
        this._router = this.$options.router
     
        // 初始化路由
        this._router.init(this)
        
        // 为 _route 属性实现双向绑定，触发组件渲染
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 设置子孙组件的 _routerRoot 为 父组件的 _routerRoot
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
  
  // $router 绑定到 Vue 实例上
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })
  
  // $route 绑定到 Vue 实例上
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
  
  // 注册 router-link 和 router-view 为全局组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
  
  // option 合并策略
  const strats = Vue.config.optionMergeStrategies
  
  // route hook 使用与 created 相同的合并策略
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
