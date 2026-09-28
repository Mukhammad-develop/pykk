// PYKK client area app — loaded by {slug}.pykk.uk/admin from the app host.
// Talks to the app API with a bearer token (no cookies — cross-subdomain safe).
(function () {
  var cfg = window.PYKK_PANEL
  var app = document.getElementById('app')
  var TOKEN_KEY = 'pykk_client_token'

  function token() {
    try { return localStorage.getItem(TOKEN_KEY) || '' } catch (e) { return '' }
  }
  function saveToken(t) {
    try { localStorage.setItem(TOKEN_KEY, t) } catch (e) {}
  }
  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY) } catch (e) {}
  }

  function api(path, opts) {
    opts = opts || {}
    opts.headers = Object.assign({ 'content-type': 'application/json' }, opts.headers || {})
    if (token()) opts.headers.authorization = 'Bearer ' + token()
    return fetch(cfg.api + path, opts).then(function (res) {
      if (res.status === 401 && path !== '/api/client/login') {
        clearToken()
        showLogin()
        throw new Error('unauthorised')
      }
      return res.json().then(function (data) {
        return { status: res.status, data: data }
      })
    })
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag)
    if (cls) node.className = cls
    if (text != null) node.textContent = text
    return node
  }
  function escMoney(pence) {
    return '£' + (pence / 100).toFixed(2)
  }
  function longDate(iso) {
    if (!iso) return '—'
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    var parts = iso.split('-').map(Number)
    var d = parts[2], m = parts[1], y = parts[0]
    var suffix = (d % 100 >= 11 && d % 100 <= 13) ? 'th' : ['th','st','nd','rd'][Math.min(d % 10, 4)] || 'th'
    return d + suffix + ' ' + months[m - 1] + ' ' + y
  }

  // ---------- login ----------
  function showLogin() {
    app.innerHTML = ''
    var wrap = el('main', 'login-wrap')
    var form = el('form', 'card')
    form.innerHTML =
      '<p class="brand">PYKK client area</p><h1>Log in</h1>' +
      '<p class="error" id="login-error" hidden></p>' +
      '<label>Email <input id="login-email" type="email" autocomplete="email" required></label>' +
      '<label>Password <input id="login-password" type="password" autocomplete="current-password" required></label>' +
      '<button type="submit" id="login-button">Log in</button>'
    form.addEventListener('submit', function (event) {
      event.preventDefault()
      var button = form.querySelector('#login-button')
      var errorBox = form.querySelector('#login-error')
      button.disabled = true
      errorBox.hidden = true
      api('/api/client/login', {
        method: 'POST',
        body: JSON.stringify({
          slug: cfg.slug,
          email: form.querySelector('#login-email').value,
          password: form.querySelector('#login-password').value,
        }),
      }).then(function (res) {
        button.disabled = false
        if (res.status === 200 && res.data.token) {
          saveToken(res.data.token)
          showApp(res.data.business)
        } else {
          errorBox.textContent = res.data.error || 'Invalid email or password.'
          errorBox.hidden = false
        }
      }).catch(function () {
        button.disabled = false
        errorBox.textContent = 'Could not reach the server — try again.'
        errorBox.hidden = false
      })
    })
    wrap.appendChild(form)
    app.appendChild(wrap)
  }

  // ---------- shell ----------
  var state = { tab: 'bond', business: null }

  function showApp(business) {
    state.business = business
    app.innerHTML = ''
    var shell = el('div', 'app-shell')
    var header = el('div', 'app-header')
    header.appendChild(el('h1', null, business.name))
    var logout = el('button', 'logout ghost', 'Log out')
    logout.addEventListener('click', function () {
      api('/api/client/logout', { method: 'POST' }).finally(function () {
        clearToken()
        showLogin()
      })
    })
    header.appendChild(logout)
    shell.appendChild(header)
    var content = el('div', null, '')
    content.id = 'content'
    shell.appendChild(content)
    var tabs = el('nav', 'tabs')
    ;[['bond', 'Bond'], ['website', 'Website info'], ['bookings', 'Bookings']].forEach(function (t) {
      var b = el('button', state.tab === t[0] ? 'active' : '', t[1])
      b.addEventListener('click', function () {
        state.tab = t[0]
        renderTab(content, tabs)
      })
      tabs.appendChild(b)
    })
    shell.appendChild(tabs)
    app.appendChild(shell)
    renderTab(content, tabs)
  }

  function renderTab(content, tabs) {
    Array.prototype.forEach.call(tabs.children, function (b, i) {
      b.className = ['bond', 'website', 'bookings'][i] === state.tab ? 'active' : ''
    })
    if (state.tab === 'bond') renderBond(content)
    else if (state.tab === 'website') renderWebsite(content)
    else renderBookings(content)
  }

  // ---------- bond ----------
  function renderBond(content) {
    content.innerHTML = '<p class="muted" style="margin-top:1rem">Loading…</p>'
    api('/api/client/bond').then(function (res) {
      var d = res.data
      content.innerHTML = ''
      var section = el('section', 'section')
      var head = el('div', 'row')
      head.appendChild(el('div', null, ''))
      var stat = el('div', null, '')
      stat.appendChild(el('p', 'muted', 'Your monthly bond'))
      stat.appendChild(el('p', 'bigstat', escMoney(d.pricePence)))
      head.appendChild(stat)
      var due = el('div', null, '')
      due.appendChild(el('p', 'muted', 'Next due'))
      due.appendChild(el('p', 'bigstat', longDate(d.nextDueDate)))
      head.appendChild(due)
      section.appendChild(head)

      if (d.bills.length === 0) {
        section.appendChild(el('p', 'muted', 'No bills yet — your first one appears here.'))
      }
      d.bills.slice().reverse().forEach(function (bill) {
        var row = el('div', 'bill')
        var left = el('div')
        left.appendChild(el('p', null, longDate(bill.dueDate)))
        left.appendChild(el('p', 'muted small', '#' + bill.reference))
        row.appendChild(left)
        var right = el('div', 'row')
        right.appendChild(el('span', 'amount', escMoney(bill.amountPence)))
        if (bill.payUrl) {
          var pay = el('a', 'pay', 'Pay now')
          pay.href = bill.payUrl
          right.appendChild(pay)
        } else {
          var badge = el('span', 'badge ' + (bill.status === 'paid' ? 'green' : bill.status === 'overdue' ? 'red' : 'sky'), bill.status.replace('_', ' '))
          right.appendChild(badge)
        }
        row.appendChild(right)
        section.appendChild(row)
      })

      var note = el('div', 'notice')
      note.innerHTML =
        'Your bond keeps your website online and looked after: hosting, updates and support from PYKK. ' +
        'Each month a bill appears here — tap <b>Pay now</b> and it takes seconds. If a bill ever stays unpaid past its grace period, ' +
        'your website is paused until it’s paid. To change anything about your bond, just message PYKK.'
      section.appendChild(note)
      content.appendChild(section)
    })
  }

  // ---------- website info ----------
  var DAYS = [['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']]

  function renderWebsite(content) {
    content.innerHTML = '<p class="muted" style="margin-top:1rem">Loading…</p>'
    api('/api/client/website').then(function (res) {
      var d = res.data
      content.innerHTML = ''
      var form = el('form', 'section')

      form.appendChild(el('h2', null, 'Opening hours'))
      var hoursBox = el('div')
      DAYS.forEach(function (day) {
        var row = el('label', 'hours-row')
        row.appendChild(el('span', null, day[1]))
        var input = el('input')
        input.value = (d.hours && d.hours[day[0]]) || ''
        input.placeholder = '09:00–18:00 or closed'
        input.dataset.day = day[0]
        row.appendChild(input)
        hoursBox.appendChild(row)
      })
      form.appendChild(hoursBox)

      form.appendChild(el('h2', null, 'Services & prices'))
      var servicesBox = el('div')
      servicesBox.id = 'services-box'
      function addServiceRow(name, price) {
        var row = el('div', 'row')
        var nameInput = el('input')
        nameInput.placeholder = 'Service name'
        nameInput.value = name || ''
        var priceInput = el('input')
        priceInput.placeholder = '£ 0.00'
        priceInput.value = price || ''
        priceInput.style.maxWidth = '6rem'
        var remove = el('button', 'ghost shrink', '✕')
        remove.type = 'button'
        remove.addEventListener('click', function () { row.remove() })
        row.appendChild(nameInput)
        row.appendChild(priceInput)
        row.appendChild(remove)
        servicesBox.appendChild(row)
      }
      ;(d.services || []).forEach(function (s) { addServiceRow(s.name, s.price) })
      if (!d.services || d.services.length === 0) addServiceRow('', '')
      form.appendChild(servicesBox)
      var addService = el('button', 'ghost', '+ Add service')
      addService.type = 'button'
      addService.addEventListener('click', function () { addServiceRow('', '') })
      form.appendChild(addService)

      form.appendChild(el('h2', null, 'What customers say (real reviews)'))
      var reviewsBox = el('div')
      reviewsBox.id = 'reviews-box'
      function addReview(author, text) {
        var box = el('div', 'review')
        var top = el('div', 'row')
        var authorInput = el('input')
        authorInput.placeholder = 'Name'
        authorInput.value = author || ''
        var remove = el('button', 'ghost shrink', '✕')
        remove.type = 'button'
        remove.addEventListener('click', function () { box.remove() })
        top.appendChild(authorInput)
        top.appendChild(remove)
        var textInput = el('textarea')
        textInput.rows = 2
        textInput.placeholder = '“…”'
        textInput.value = text || ''
        box.appendChild(top)
        box.appendChild(textInput)
        reviewsBox.appendChild(box)
      }
      ;(d.reviews || []).forEach(function (r) { addReview(r.author, r.text) })
      if (!d.reviews || d.reviews.length === 0) addReview('', '')
      form.appendChild(reviewsBox)
      var addReviewBtn = el('button', 'ghost', '+ Add review')
      addReviewBtn.type = 'button'
      addReviewBtn.addEventListener('click', function () { addReview('', '') })
      form.appendChild(addReviewBtn)

      form.appendChild(el('h2', null, 'Your story / about'))
      var story = el('textarea')
      story.rows = 4
      story.id = 'story'
      story.value = d.additionalInfo || ''
      form.appendChild(story)

      var saveBtn = el('button', null, 'Save & update my website')
      saveBtn.type = 'submit'
      form.appendChild(saveBtn)
      var statusLine = el('p', 'muted small')
      statusLine.id = 'save-status'
      form.appendChild(statusLine)

      form.addEventListener('submit', function (event) {
        event.preventDefault()
        saveBtn.disabled = true
        statusLine.textContent = 'Saving…'
        var hours = {}
        Array.prototype.forEach.call(form.querySelectorAll('input[data-day]'), function (input) {
          hours[input.dataset.day] = input.value.trim()
        })
        var services = Array.prototype.map
          .call(servicesBox.children, function (row) {
            var inputs = row.querySelectorAll('input')
            return { name: inputs[0].value.trim(), price: inputs[1].value.trim() }
          })
          .filter(function (s) { return s.name })
        var reviews = Array.prototype.map
          .call(reviewsBox.children, function (box) {
            return {
              author: box.querySelector('input').value.trim(),
              text: box.querySelector('textarea').value.trim(),
            }
          })
          .filter(function (r) { return r.author && r.text })
        api('/api/client/website', {
          method: 'PUT',
          body: JSON.stringify({ hours: hours, services: services, reviews: reviews, additionalInfo: story.value }),
        }).then(function (res2) {
          if (res2.status === 200) {
            statusLine.textContent = 'Saved — your website is updating (about a minute)…'
            pollStatus(statusLine, saveBtn)
          } else {
            saveBtn.disabled = false
            statusLine.textContent = (res2.data && res2.data.error) || 'Could not save — try again.'
          }
        })
      })
      content.appendChild(form)
    })
  }

  function pollStatus(statusLine, saveBtn) {
    var tries = 0
    var timer = setInterval(function () {
      tries++
      api('/api/client/website').then(function (res) {
        if (res.data.websiteStatus !== 'building') {
          clearInterval(timer)
          saveBtn.disabled = false
          statusLine.textContent = '✓ Your website is updated.'
          if (res.data.websiteStatus === 'failed') statusLine.textContent = 'Update saved, but the rebuild failed — PYKK has been notified.'
        } else if (tries > 45) {
          clearInterval(timer)
          saveBtn.disabled = false
          statusLine.textContent = 'Still updating — check back in a minute.'
        }
      })
    }, 4000)
  }

  // ---------- bookings ----------
  function renderBookings(content) {
    content.innerHTML = '<p class="muted" style="margin-top:1rem">Loading…</p>'
    api('/api/client/bookings').then(function (res) {
      var d = res.data
      content.innerHTML = ''
      var section = el('section', 'section')
      if (!d.bookings || d.bookings.length === 0) {
        section.appendChild(el('p', 'muted', 'No bookings yet. When customers book through your website, they appear here.'))
      } else {
        var now = Date.now()
        d.bookings.forEach(function (b) {
          var row = el('div', 'bill')
          var left = el('div')
          var when = b.startsAt ? new Date(b.startsAt) : null
          left.appendChild(el('p', null, when ? when.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }) : '—'))
          var who = (b.customerName || 'Customer') + (b.service ? ' · ' + b.service : '')
          left.appendChild(el('p', 'muted small', who))
          if (b.customerPhone) left.appendChild(el('p', 'muted small', b.customerPhone))
          row.appendChild(left)
          var right = el('div', null)
          right.style.textAlign = 'right'
          var badgeColor = b.status === 'confirmed' ? 'green' : b.status === 'cancelled' ? 'red' : b.status === 'completed' ? 'sky' : b.status === 'no_show' ? 'red' : 'amber'
          right.appendChild(el('span', 'badge ' + badgeColor, b.status.replace('_', ' ')))
          row.appendChild(right)
          section.appendChild(row)

          if ((b.status === 'pending' || b.status === 'confirmed') && when && when.getTime() > now - 86400000) {
            var actions = el('div', 'row')
            actions.style.marginTop = '-.35rem'
            ;[
              ['confirmed', 'Confirm'],
              ['completed', 'Done'],
              ['no_show', 'No-show'],
              ['cancelled', 'Cancel'],
            ].forEach(function (pair) {
              if (pair[0] === b.status) return
              var btn = el('button', 'ghost small', pair[1])
              btn.style.fontSize = '.75rem'
              btn.addEventListener('click', function () {
                btn.disabled = true
                api('/api/client/bookings/' + b.id + '/status', {
                  method: 'POST',
                  body: JSON.stringify({ action: pair[0] }),
                }).then(function () { renderBookings(content) })
              })
              actions.appendChild(btn)
            })
            if (actions.children.length) section.appendChild(actions)
          }
        })
      }
      content.appendChild(section)
    })
  }

  // ---------- boot ----------
  if (token()) {
    api('/api/client/bond').then(function (res) {
      if (res.status === 200) showApp(res.data.business)
      else showLogin()
    }).catch(showLogin)
  } else {
    showLogin()
  }
})()
