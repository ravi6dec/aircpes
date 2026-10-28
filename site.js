/* AIRCPES 2027 — site behaviour.
   To publish the Microsoft CMT link, paste it between the quotes below. */
var CMT_URL = "https://cmt3.research.microsoft.com/AIRCPES2027/Submission/Index";

(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Mobile menu
  var btn = $('.menu-btn'), links = $('#navlinks');
  if (btn && links) btn.addEventListener('click', function () {
    btn.setAttribute('aria-expanded', links.classList.toggle('open'));
  });

  // Theme toggle (remembered per browser)
  var tbtn = $('#theme-toggle'), root = document.documentElement;
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncIcon() { if (tbtn) tbtn.textContent = isDark() ? '☀️' : '🌙'; }
  syncIcon();
  if (tbtn) tbtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncIcon();
  });

  // Microsoft CMT link + modal
  $$('[data-cmt-link]').forEach(function (a) {
    if (CMT_URL) { a.href = CMT_URL; a.hidden = false; }
  });
  $$('[data-cmt-status]').forEach(function (el) {
    if (CMT_URL) el.innerHTML = 'Submissions are open on Microsoft CMT: <a href="' + CMT_URL + '" target="_blank" rel="noopener">' + CMT_URL + '</a>';
  });
  var modal = $('#cmt-modal');
  $$('[data-open-cmt]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (modal && modal.showModal) modal.showModal(); else location.href = 'submission.html';
    });
  });
  $$('[data-close-cmt]').forEach(function (b) { b.addEventListener('click', function () { modal.close(); }); });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });

  // Important dates: mark past, tag next
  var now = new Date();
  $$('.dates').forEach(function (list) {
    var tagged = false;
    $$('li[data-date]', list).forEach(function (li) {
      var d = new Date(li.getAttribute('data-date') + 'T23:59:00+05:30');
      if (d < now) li.classList.add('past');
      else if (!tagged) {
        tagged = true;
        var days = Math.ceil((d - now) / 86400000);
        var s = document.createElement('span'); s.className = 'next';
        s.textContent = days <= 0 ? 'Today' : 'Next · ' + days + ' days left';
        li.appendChild(s);
      }
    });
  });

  // Countdown (with seconds)
  var cd = $('#countdown');
  if (cd) {
    var steps = [
      { t: new Date('2027-01-10T23:59:00+05:30'), l: 'Paper submission closes in' },
      { t: new Date('2027-03-08T09:00:00+05:30'), l: 'Conference begins in' }
    ];
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var tick = function () {
      var n = new Date(), step = null;
      for (var i = 0; i < steps.length; i++) if (steps[i].t > n) { step = steps[i]; break; }
      if (!step) { $('.cells', cd).style.display = 'none'; $('#cd-label').textContent = 'AIRCPES 2027 has concluded'; return; }
      $('#cd-label').textContent = step.l;
      var s = Math.floor((step.t - n) / 1000);
      $('#cd-d').textContent = Math.floor(s / 86400);
      $('#cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
      $('#cd-m').textContent = pad(Math.floor(s % 3600 / 60));
      $('#cd-s').textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // Calendar (.ics) download of key dates
  $$('[data-ics]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ev = [
        ['20270110', '20270111', 'AIRCPES 2027: Paper submission deadline'],
        ['20270201', '20270202', 'AIRCPES 2027: Notification of acceptance'],
        ['20270215', '20270216', 'AIRCPES 2027: Camera-ready paper submission'],
        ['20270225', '20270226', 'AIRCPES 2027: Author registration deadline'],
        ['20270308', '20270310', 'AIRCPES 2027 Conference (hybrid) — MAIT Delhi & BCU UK']
      ];
      var stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AIRCPES 2027//EN', 'CALSCALE:GREGORIAN'];
      ev.forEach(function (e, i) {
        lines.push('BEGIN:VEVENT', 'UID:aircpes2027-' + i + '@aircpes.in', 'DTSTAMP:' + stamp,
          'DTSTART;VALUE=DATE:' + e[0], 'DTEND;VALUE=DATE:' + e[1], 'SUMMARY:' + e[2],
          'URL:https://www.aircpes.in/', 'END:VEVENT');
      });
      lines.push('END:VCALENDAR');
      var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'AIRCPES-2027-dates.ics';
      document.body.appendChild(a); a.click(); a.remove();
    });
  });

  // Print / save CFP
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  // Tabs
  $$('.tabs').forEach(function (bar) {
    $$('.tab', bar).forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.tab', bar).forEach(function (o) {
          var on = o === t; o.classList.toggle('active', on); o.setAttribute('aria-selected', on);
          var p = document.getElementById(o.getAttribute('data-tab')); if (p) p.hidden = !on;
        });
      });
    });
  });

  // Search filters (searches across tabs too)
  $$('.filter').forEach(function (inp) {
    var box = document.getElementById(inp.getAttribute('data-target'));
    var none = box.parentNode.querySelector('.no-match');
    var tabs = box.parentNode.querySelector('.tabs');
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase(), shown = 0;
      $$('.dcard, .np', box).forEach(function (c) {
        var hit = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
        c.hidden = !hit; if (hit) shown++;
      });
      if (tabs) {
        if (q) { $$('.tab-panel', box).forEach(function (p) { p.hidden = false; }); tabs.style.display = 'none'; }
        else { tabs.style.display = ''; var act = $('.tab.active', tabs); $$('.tab-panel', box).forEach(function (p) { p.hidden = p.id !== act.getAttribute('data-tab'); }); }
      }
      if (none) none.style.display = shown ? 'none' : 'block';
    });
  });

  // Fee currency switch
  $$('.seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.seg-btn').forEach(function (o) { o.classList.toggle('active', o === b); });
      var c = b.getAttribute('data-cur');
      $$('.fee [data-col]').forEach(function (cell) { cell.hidden = c !== 'all' && cell.getAttribute('data-col') !== c; });
    });
  });

  // Back to top
  var tt = $('.to-top');
  window.addEventListener('scroll', function () { tt.classList.toggle('show', window.scrollY > 700); }, { passive: true });
  tt.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
})();
