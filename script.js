/* Stingen: настройки заявок. Заполните один из способов приёма. */
const CONFIG = {
  // 1) Рекомендуется: адрес формы из Formspree (https://formspree.io), вида "https://formspree.io/f/xxxxxxxx".
  //    Заявки придут на вашу почту. Подходит и любой другой сервис, который принимает JSON через POST.
  formEndpoint: '',
  // 2) Запасной вариант, если адрес выше пуст: откроется письмо с готовым текстом заявки.
  email: 'hello@stingen.example'
};

(function () {
  var nav = document.querySelector('[data-nav]');
  var burger = document.querySelector('[data-burger]');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.mmenu a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  document.querySelectorAll('[data-tour]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.getElementById('f-tour');
      if (sel) sel.value = a.dataset.tour;
    });
  });

  var form = document.getElementById('form');
  if (!form) return;
  var fail = document.getElementById('fail');
  var send = document.getElementById('send');

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field.bad'); if (f) f.classList.remove('bad');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    fail.classList.remove('show');
    var el = form.elements;
    var name = el.name.value.trim();
    var checks = { name: !!name, contact: !!el.contact.value.trim(), ok: el.ok.checked };
    var first = null;
    Object.keys(checks).forEach(function (k) {
      var f = form.querySelector('[data-f="' + k + '"]');
      f.classList.toggle('bad', !checks[k]);
      if (!checks[k] && !first) first = f;
    });
    if (first) { var inp = first.querySelector('input'); if (inp) inp.focus(); return; }
    if (el._gotcha.value) { showDone(name); return; }

    var tourLabel = el.tour.options[el.tour.selectedIndex].text;
    var data = {
      'Имя': name,
      'Контакт': el.contact.value.trim(),
      'Тур': tourLabel,
      'Когда удобно': el.period.value,
      'Опыт': form.querySelector('input[name="exp"]:checked').value,
      'Фотокнига': el.book.checked ? 'да (+4 000 ₽)' : 'нет',
      'Комментарий': el.msg.value.trim()
    };

    if (CONFIG.formEndpoint) {
      send.disabled = true; send.textContent = 'Отправляем…';
      fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        showDone(name);
      }).catch(function () {
        fail.classList.add('show');
        send.disabled = false; send.textContent = 'Отправить заявку';
      });
    } else {
      var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
      window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Заявка на тур Stingen') + '&body=' + encodeURIComponent(body);
      showDone(name);
    }
  });

  function showDone(name) {
    document.getElementById('thanks').textContent = 'Спасибо, ' + name + '!';
    document.getElementById('card').classList.add('sent');
  }
})();
