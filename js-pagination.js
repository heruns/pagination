(() => {
  function Pagination (el, options) {
    this.el = el
    this.currentPage = parseInt(options.currentPage)
    this.total = parseInt(options.total)
    this.options = options
    this.render()
  }
  /** 初始化页码组件元素 */
  Pagination.prototype.initContainer = function () {
    this.el.className = 'my-pagination'
    this.el.addEventListener('click', e => {
      let page = e.target.dataset.page
      if (!page) return
      page = parseInt(page)
      this.options.onChange && this.options.onChange.call(this, page, this.currentPage, this.total)
    })
  }
  /** 渲染页码按钮 */
  Pagination.prototype.renderBtn = function (page, text) {
    if (page < 1 || page > this.total) return null
    const button = document.createElement('button')
    button.className = page === this.currentPage ? 'btn current-btn' : 'btn'
    button.textContent = text || page
    button.dataset.page = page
    return button
  }
  /** 渲染第一页按钮 */
  Pagination.prototype.renderFirstPageBtn = function () {
    if (this.currentPage < 4) return null
    return this.renderBtn(1)
  }
  /** 渲染更多按钮 */
  Pagination.prototype.renderMoreBtn = function (direction) {
    const isLeft = direction === 'left'
    const shouldRender = isLeft ? this.currentPage > 4 : this.total - this.currentPage > 2
    if (!shouldRender) return null
    const button = document.createElement('button')
    button.className = 'btn'
    button.textContent = '...'
    button.disabled = true
    return button
  }
  /** 渲染组件 */
  Pagination.prototype.render = function () {
    this.initContainer()
    this.update()
  }
  /** 更新页码按钮 */
  Pagination.prototype.update = function () {
    this.el.innerHTML = ''
    const { currentPage } = this
    const buttons = [
      this.renderBtn(currentPage - 1, '上一页'), // 上一页按钮
      this.renderFirstPageBtn(), // 第1页按钮
      this.renderMoreBtn('left'), // 左边更多按钮
      this.renderBtn(currentPage - 2), // 前2页按钮
      this.renderBtn(currentPage - 1), // 前1页
      this.renderBtn(currentPage), // 当前页码
      this.renderBtn(currentPage + 1), // 下1页
      this.renderBtn(currentPage + 2), // 下2页
      this.renderMoreBtn('right'), // 右边更多按钮
      this.renderBtn(currentPage + 1, '下一页') // 下一页按钮
    ]
    buttons.filter(Boolean).forEach(button => this.el.appendChild(button))
  }
  /** 设置当前页码 */
  Pagination.prototype.setCurrentPage = function (page) {
    this.currentPage = page
    this.update()
  }
  
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
  /** 初始化 js 分页部分 */
  async function init () {
    const container = document.querySelector('.js-pagination')
    const list = document.createElement('ul')
    container.appendChild(list)
    // 更新列表
    const updateList = async pageIndex => {
      const res = await ajaxGet('http://yapi.luckly-mjw.cn/mock/50/test/users', { pageIndex })
      const listItems = res.data.list.map(item => `<li class="list-item">${item.userName}（${item.address}）</li>`)
      list.innerHTML = listItems.join('')
      return res
    }

    // 初始化分页组件
    const pagination = new Pagination(document.createElement('div'), {
      currentPage: 1,
      total: 1,
      onChange (page, currentPage, total) {
        this.setCurrentPage(page)
        updateList(page)
      }
    })
    document.querySelector('.js-pagination').appendChild(pagination.el)
    const res = await updateList(1)
    pagination.total = parseInt(res.data.page.pageSum)
    pagination.update()
  }

  init()
})()
