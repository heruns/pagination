(() => {
  // 分页组件
  Vue.component('my-pagination', {
    props: {
      total: Number,
      currentPage: Number
    },
    template: `
      <div class="my-pagination">
        <button class="btn" v-if="shouldRender(currentPage - 1)"  @click="handlePageClick(currentPage - 1)">上一页</button>
        <button class="btn" v-if="currentPage >= 4"  @click="handlePageClick(1)">1</button>
        <button class="btn" v-if="currentPage > 4"  disabled>...</button>
        <button class="btn" v-if="shouldRender(currentPage - 2)"  @click="handlePageClick(currentPage - 2)">{{currentPage - 2}}</button>
        <button class="btn" v-if="shouldRender(currentPage - 1)"  @click="handlePageClick(currentPage - 1)">{{currentPage - 1}}</button>
        <button class="btn current-btn" @click="handlePageClick(currentPage)">{{currentPage}}</button>
        <button class="btn" v-if="shouldRender(currentPage + 1)"  @click="handlePageClick(currentPage + 1)">{{currentPage + 1}}</button>
        <button class="btn" v-if="shouldRender(currentPage + 2)"  @click="handlePageClick(currentPage + 2)">{{currentPage + 2}}</button>
        <button class="btn" v-if="total - currentPage > 2"  disabled>...</button>
        <button class="btn" v-if="shouldRender(currentPage + 1)"  @click="handlePageClick(currentPage + 1)">下一页</button>
      </div>
    `,
    methods: {
      shouldRender (page) {
        return page > 0 && page <= this.total
      },
      handlePageClick (page) {
        this.$emit('change', page)
      }
    }
  })

  // Vue 实例
  const app = new Vue({
    el: '.vue-pagination',
    template: `
      <div>
        <ul>
          <li class="list-item" v-for="item in list" :key="item.id">{{item.userName}}（{{item.address}}）</li>
        </ul>
        <my-pagination :currentPage="currentPage" :total="total" @change="handlePageChange"></my-pagination>
      <div>
    `,
    data: {
      currentPage: 1,
      total: 1,
      list: []
    },
    created () {
      this.updateList(1)
    },
    methods: {
      handlePageChange (page) {
        this.currentPage = page
        this.updateList(page)
      },
      async updateList (pageIndex) {
        const { data } = await ajaxGet('http://yapi.luckly-mjw.cn/mock/50/test/users', { pageIndex })
        this.list = data.list
        this.currentPage = parseInt(data.page.pageIndex)
        this.total = parseInt(data.page.pageSum)
      }
    }
  })

  /** 发送 ajax Get 请求 */
  function ajaxGet (url, params) {
    const xhr = new XMLHttpRequest()
    if (params) {
      const str = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      const hasSearch = url.indexOf('?') > -1
      url = hasSearch ? `${url}&${str}` : `${url}?${str}`
    }
    xhr.open('get', url)
    const promise = new Promise((resolve, reject) => {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(xhr.status))
          }
        }
      }
    })
    xhr.send(null)
    return promise
  }
})()
