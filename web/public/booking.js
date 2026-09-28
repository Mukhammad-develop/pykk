// PYKK website booking form behavior — served from the app host, used by every
// client site that takes bookings. Reads the form's data attributes, POSTs to
// the app API, shows success or the server's reason.
(function () {
  var form = document.getElementById('booking-form')
  if (!form) return
  var api = form.getAttribute('data-api')
  var slug = form.getAttribute('data-slug')
  var errorBox = document.getElementById('booking-error')
  var successBox = document.getElementById('booking-success')
  var submit = form.querySelector('.booking-submit')

  form.addEventListener('submit', function (event) {
    event.preventDefault()
    if (errorBox) errorBox.hidden = true
    if (successBox) successBox.hidden = true
    if (submit) submit.disabled = true

    var data = {
      slug: slug,
      service: form.service.value,
      date: form.date.value,
      time: form.time.value,
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      note: form.note.value.trim(),
    }

    fetch(api + '/api/booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        return res.json().then(function (body) {
          return { status: res.status, body: body }
        })
      })
      .then(function (res) {
        if (submit) submit.disabled = false
        if (res.status === 200 && res.body.ok) {
          form.reset()
          if (successBox) successBox.hidden = false
        } else if (errorBox) {
          errorBox.textContent = res.body.error || 'Something went wrong — please try again or call us.'
          errorBox.hidden = false
        }
      })
      .catch(function () {
        if (submit) submit.disabled = false
        if (errorBox) {
          errorBox.textContent = 'Could not reach the booking service — please try again or call us.'
          errorBox.hidden = false
        }
      })
  })
})()
