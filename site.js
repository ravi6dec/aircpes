(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn'), links = document.getElementById('navlinks');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  // Important dates: mark past, tag the next one
  var now = new Date();
  document.querySelectorAll('.dates').forEach(function (list) {
    var tagged = false;
    list.querySelectorAll('li[data-date]').forEach(function (li) {
      var d = new Date(li.getAttribute('data-date') + 'T23:59:00+05:30');
      if (d < now) { li.classList.add('past'); }
      else if (!tagged) {
        tagged = true;
        var days = Math.ceil((d - now) / 86400000);
        var s = document.createElement('span'); s.className = 'next';
        s.textContent = days <= 0 ? 'Today' : 'Next · ' + days + ' days left';
        li.appendChild(s);
      }
    });
  });

  // Countdown
  var box = document.getElementById('countdown');
  if (box) {
    var steps = [
      { t: new Date('2027-01-10T23:59:00+05:30'), l: 'Paper submission closes in' },
      { t: new Date('2027-03-08T09:00:00+05:30'), l: 'Conference begins in' }
    ];
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var tick = function () {
      var n = new Date(), step = null;
      for (var i = 0; i < steps.length; i++) { if (steps[i].t > n) { step = steps[i]; break; } }
      if (!step) { box.style.display = 'none'; return; }
      document.getElementById('cd-label').textContent = step.l;
      var s = Math.floor((step.t - n) / 1000);
      document.getElementById('cd-d').textContent = Math.floor(s / 86400);
      document.getElementById('cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
      document.getElementById('cd-m').textContent = pad(Math.floor(s % 3600 / 60));
    };
    tick(); setInterval(tick, 30000);
  }

  // Search filter
  document.querySelectorAll('.filter').forEach(function (inp) {
    var grid = document.getElementById(inp.getAttribute('data-target'));
    var none = grid.parentNode.querySelector('.no-match');
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase(), shown = 0;
      grid.querySelectorAll('.np').forEach(function (np) {
        var hit = !q || np.textContent.toLowerCase().indexOf(q) !== -1;
        np.hidden = !hit; if (hit) shown++;
      });
      if (none) none.style.display = shown ? 'none' : 'block';
    });
  });

  // Back to top
  var tt = document.querySelector('.to-top');
  window.addEventListener('scroll', function () { tt.classList.toggle('show', window.scrollY > 700); }, { passive: true });
  tt.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
})();
