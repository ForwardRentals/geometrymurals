(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // mobile menu
  var b = $('.burger');
  if (b) b.addEventListener('click', function () { document.body.classList.toggle('menu'); });
  $$('.mnav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu'); }); });

  // sliders
  var lb = $('#lb'), lbImg = lb && $('img', lb), lbState = null;
  function openLb(s, i) { lbState = { s: s, i: i }; show(); lb.classList.add('on'); }
  function show() {
    var imgs = lbState.s.imgs;
    lbImg.src = imgs[lbState.i].src;
  }
  function step(d) { var n = lbState.s.imgs.length; lbState.i = (lbState.i + d + n) % n; show(); }
  if (lb) {
    $('.x', lb).onclick = function () { lb.classList.remove('on'); };
    $('.pv', lb).onclick = function (e) { e.stopPropagation(); step(-1); };
    $('.nx', lb).onclick = function (e) { e.stopPropagation(); step(1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('on'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') lb.classList.remove('on');
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }
  $$('.slider').forEach(function (el) {
    var imgs = $$('.slides img', el), ths = $$('.th', el), i = 0, s = { imgs: imgs };
    function go(n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      ths.forEach(function (t, k) { t.classList.toggle('on', k === i); });
      var t = ths[i];
      if (t) { var box = t.parentNode; box.scrollTo({ left: t.offsetLeft - box.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' }); }
    }
    $('.pv', el).onclick = function () { go(i - 1); };
    $('.nx', el).onclick = function () { go(i + 1); };
    ths.forEach(function (t, k) { t.onclick = function () { go(k); }; });
    imgs.forEach(function (im, k) { im.onclick = function () { openLb(s, k); }; });
    // swipe
    var x0 = null, st = $('.stage', el);
    st.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    go(0);
  });

  // testimonials
  var tf = $$('.tslides figure');
  if (tf.length) {
    var dots = $('.tdots'), ti = 0, timer;
    tf.forEach(function (_, k) {
      var d = document.createElement('button');
      d.setAttribute('aria-label', 'Testimonial ' + (k + 1));
      d.onclick = function () { setT(k, true); };
      dots.appendChild(d);
    });
    function setT(k, manual) {
      ti = k;
      tf.forEach(function (f, j) { f.classList.toggle('on', j === k); });
      $$('button', dots).forEach(function (d, j) { d.classList.toggle('on', j === k); });
      if (manual) { clearInterval(timer); timer = setInterval(function () { setT((ti + 1) % tf.length); }, 9000); }
    }
    setT(0, true);
  }

  // scroll reveal for headings
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    $$('.blk h2,.pg h1,.proj h2,.lede,.about .pair img,.tst h2').forEach(function (n) { n.classList.add('rv'); io.observe(n); });
  }

  // header hides on scroll down, returns on scroll up
  var hdr = $('.hdr'), lastY = window.scrollY, ht = false;
  if (hdr) window.addEventListener('scroll', function () {
    var y = window.scrollY, d = y - lastY;
    if (document.body.classList.contains('menu')) return;
    if (y < 90) hdr.classList.remove('hide');
    else if (d > 6) hdr.classList.add('hide');
    else if (d < -6) hdr.classList.remove('hide');
    if (Math.abs(d) > 6 || y < 90) lastY = y;
  }, { passive: true });

  // clothing parallax + reveal
  var bi = $('.bimg');
  if (bi) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { bi.style.transform = 'translateY(' + Math.min(window.scrollY, 900) * 0.28 + 'px)'; tick = false; });
    }, { passive: true });
  }
  var cf = $$('.cl figure');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io2.unobserve(e.target); } }); }, { threshold: .12 });
    cf.forEach(function (n) { io2.observe(n); });
  } else { cf.forEach(function (n) { n.classList.add('vis'); }); }
  var mc = $('.masonry');
  if (mc) {
    var mimgs = $$('img', mc);
    var layout = function () {
      var n = window.innerWidth <= 820 ? 2 : 4, gap = 6, cols = [], hs = [];
      mc.innerHTML = ''; mc.classList.add('js');
      for (var c = 0; c < n; c++) { var d = document.createElement('div'); d.className = 'mcol'; mc.appendChild(d); cols.push(d); hs.push(0); }
      mimgs.forEach(function (im) {
        var k = hs.indexOf(Math.min.apply(null, hs));
        cols[k].appendChild(im);
        hs[k] += (im.height || 1) / (im.width || 1);
      });
    };
    mimgs.forEach(function (im) { im.setAttribute('data-w', im.getAttribute('width')); im.setAttribute('data-h', im.getAttribute('height')); });
    var origLayout = layout;
    layout = function () {
      var n = window.innerWidth <= 820 ? 2 : 4, cols = [], hs = [];
      mc.innerHTML = ''; mc.classList.add('js');
      for (var c = 0; c < n; c++) { var d = document.createElement('div'); d.className = 'mcol'; mc.appendChild(d); cols.push(d); hs.push(0); }
      mimgs.forEach(function (im) {
        var k = hs.indexOf(Math.min.apply(null, hs));
        cols[k].appendChild(im);
        hs[k] += (+im.getAttribute('data-h')) / (+im.getAttribute('data-w'));
      });
    };
    layout();
    var lastN = window.innerWidth <= 820 ? 2 : 4;
    window.addEventListener('resize', function () { var n = window.innerWidth <= 820 ? 2 : 4; if (n !== lastN) { lastN = n; layout(); } });
  }
  var ms = $$('.masonry img');
  ms.forEach(function (im, k) { im.onclick = function () { openLb({ imgs: ms }, k); }; });

  // contact form -> FormSubmit (emails the inbox directly); mailto fallback on failure
  $$('.cf').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return (f.elements[n] || {}).value || ''; };
      var msg = $('.fm', f), btn = $('button', f);
      btn.disabled = true; btn.textContent = 'Sending...';
      var data = { name: v('fname') + ' ' + v('lname'), email: v('email'), message: v('msg'), 'Tell us more': v('more'), phone: v('phone'), 'How did you hear about us': v('how'), _subject: 'Geometry.222 inquiry from ' + v('fname') + ' ' + v('lname'), _replyto: v('email'), _template: 'table', _captcha: 'false' };
      fetch('https://formsubmit.co/ajax/' + f.dataset.to, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (String(j.success) !== 'true') { console.warn('FormSubmit:', j); var er = new Error(j.message || 'fail'); er.fs = true; throw er; }
          msg.textContent = 'Thank you! Your message has been sent. We will be in touch soon.'; msg.hidden = false; f.reset(); btn.textContent = 'Sent';
        })
        .catch(function (err) {
          console.warn('Form error:', err);
          if (err && err.fs && /activat/i.test(err.message)) {
            msg.textContent = 'This form is still being activated and could not deliver your message yet. Please email ' + f.dataset.to + ' directly.'; msg.hidden = false;
            btn.disabled = false; btn.textContent = 'Submit';
            return;
          }
          var body = ['Name: ' + data.name, 'Email: ' + data.email, '', data.message].join('\n');
          msg.textContent = 'Could not send automatically. Your email app should open instead; or email ' + f.dataset.to + ' directly.'; msg.hidden = false;
          btn.disabled = false; btn.textContent = 'Submit';
          location.href = 'mailto:' + f.dataset.to + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(body);
        });
    });
  });
})();
