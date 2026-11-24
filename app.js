(function () {
  'use strict';
  var T = window.TT || {};
  var PKGS = {
    LT: { name: 'Sách lý thuyết Montessori Phonics', price: 499000 },
    GC: { name: 'Bộ Giáo cụ · file in', price: 990000 },
    DUO: { name: 'Bộ đôi: Lý thuyết + Giáo cụ', price: 1399000 },
    COMBO3: { name: 'Combo 3: Lý thuyết + Checklist + Giáo cụ', price: 1499000 },
    FULL: { name: 'Trọn bộ: Combo 3 + đào tạo online (2 giờ)', price: 1999000 }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return Number(n).toLocaleString('vi-VN') + 'đ'; };
  var ref = new URLSearchParams(location.search).get('ref') || document.referrer.replace(/^https?:\/\//, '').split('/')[0] || '';

  // ---------- Liên hệ ----------
  var phoneHref = T.HOTLINE ? 'tel:' + T.HOTLINE.replace(/\s/g, '') : '';
  var hr = $('#hotlineRow');
  if (hr) {
    if (T.HOTLINE) hr.insertAdjacentHTML('beforeend', '<a class="btn btn-green" href="' + phoneHref + '">Gọi ' + (T.HOTLINE_NAME ? T.HOTLINE_NAME + ' · ' : '') + T.HOTLINE + '</a>');
    if (T.ZALO) hr.insertAdjacentHTML('beforeend', '<a class="btn btn-line" href="' + T.ZALO + '" target="_blank" rel="noopener">Nhắn Zalo</a>');
  }
  var fl = $('#float');
  if (fl) {
    if (T.ZALO) fl.insertAdjacentHTML('beforeend', '<a href="' + T.ZALO + '" target="_blank" rel="noopener" aria-label="Nhắn Zalo" style="background:#0068FF"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></a>');
    if (T.HOTLINE) fl.insertAdjacentHTML('beforeend', '<a href="' + phoneHref + '" aria-label="Gọi hotline" style="background:#1E7B3C"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></a>');
  }
  var fc = $('#ftContact');
  if (fc) fc.innerHTML = [T.HOTLINE ? 'Hotline tư vấn' + (T.HOTLINE_NAME ? ' (' + T.HOTLINE_NAME + ')' : '') + ': <a href="' + phoneHref + '">' + T.HOTLINE + '</a>' : '', T.EMAIL ? 'Email: <a href="mailto:' + T.EMAIL + '">' + T.EMAIL + '</a>' : ''].filter(Boolean).join('<br>');
  var lg = $('#legal'); if (lg && T.LEGAL) lg.textContent = T.LEGAL;

  // ---------- Quy mô: số trang ----------
  $$('[data-pages]').forEach(function (el) { var v = (T.PAGES || {})[el.getAttribute('data-pages')]; if (v) el.textContent = ' · ' + v + ' trang'; });
  // ---------- Đặt trước bộ giáo cụ ----------
  $$('[data-kind]').forEach(function (a) { a.addEventListener('click', function () { var f = $('#leadForm'); if (f && f.kind) { f.kind.value = a.getAttribute('data-kind'); if (!f.note.value) f.note.value = a.getAttribute('data-kind') === 'kit' ? 'Đặt trước bộ giáo cụ thành phẩm – số lớp/số bộ: ' : 'Gói Chuyển giao – số lớp 3–6 tuổi, số giáo viên: '; } }); });

  // ---------- API ----------
  function api(method, data) {
    if (!T.API) return Promise.reject(new Error('NO_API'));
    if (method === 'GET') {
      return fetch(T.API + '?' + new URLSearchParams(data)).then(function (r) { return r.json(); });
    }
    return fetch(T.API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); });
  }

  // ---------- Thanh toán ----------
  var modal = $('#modal'), cur = null, poll = null, timer = null, lastFocus = null;
  function step(n) {
    $('#s1').hidden = n !== 1; $('#s2').hidden = n !== 2; $('#s3').hidden = n !== 3;
    $('#b2').className = n >= 2 ? 'on' : ''; $('#b3').className = n >= 3 ? 'on' : '';
    $('#mStep').textContent = n === 1 ? 'Bước 1/2 · Thông tin nhận tài liệu' : n === 2 ? 'Bước 2/2 · Quét mã để thanh toán' : 'Hoàn tất';
  }
  function open(pkg) {
    cur = pkg; lastFocus = document.activeElement;
    $('#mTitle').textContent = PKGS[pkg].name;
    $('#mPrice').textContent = fmt(PKGS[pkg].price);
    $('#s1Err').textContent = '';
    step(1);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var i = $('#s1 input[name=name]'); if (i) i.focus(); }, 50);
    if (window.gtag) gtag('event', 'begin_checkout', { items: [pkg] });
    if (window.fbq) fbq('track', 'InitiateCheckout', { content_ids: [pkg], value: PKGS[pkg].price, currency: 'VND' });
  }
  function close() {
    modal.classList.remove('open'); document.body.style.overflow = '';
    clearInterval(poll); clearInterval(timer);
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-buy]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(b.getAttribute('data-buy')); }); });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = $('#' + b.getAttribute('data-copy')).textContent.replace(/\./g, '').replace('đ', '').trim();
      if (b.getAttribute('data-copy') === 'kAcc' || b.getAttribute('data-copy') === 'kCode') t = $('#' + b.getAttribute('data-copy')).textContent.trim();
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () {
        b.textContent = 'Đã chép'; setTimeout(function () { b.textContent = 'Chép'; }, 1500);
      }, function () {});
    });
  });

  function showQR(o) {
    $('#qr').src = o.qr;
    $('#kBank').textContent = o.bank; $('#kAcc').textContent = o.accountNo; $('#kName').textContent = o.accountName;
    $('#kAmt').textContent = fmt(o.amount); $('#kAmtRaw').textContent = String(o.amount); $('#kCode').textContent = o.code;
    $('#mPrice').textContent = fmt(o.amount);
    var cr = $('#credit');
    if (o.credit) { cr.hidden = false; cr.textContent = 'Đã trừ ' + fmt(o.credit) + ' từ tài liệu bạn mua trước đó.'; } else cr.hidden = true;
    step(2);
    var end = o.expiresAt ? new Date(o.expiresAt).getTime() : Date.now() + 30 * 60e3;
    clearInterval(timer);
    timer = setInterval(function () {
      var s = Math.max(0, Math.round((end - Date.now()) / 1000));
      $('#cd').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      if (!s) { clearInterval(timer); $('#waitTxt').innerHTML = 'Mã đã hết hạn giữ. Nếu bạn đã chuyển khoản, hệ thống vẫn ghi nhận – hoặc đóng và tạo đơn mới.'; }
    }, 1000);
  }

  $('#s1').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, err = $('#s1Err'), btn = $('#s1Btn');
    var d = { action: 'order', pkg: cur, name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim().toLowerCase(), consent: f.consent.checked, ref: ref };
    if (d.name.length < 2) return (err.textContent = 'Vui lòng nhập họ tên.');
    if (d.phone.replace(/\D/g, '').length < 9) return (err.textContent = 'Số điện thoại chưa đúng.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return (err.textContent = 'Email chưa đúng.');
    if (!d.consent) return (err.textContent = 'Vui lòng đồng ý điều khoản và chính sách bảo mật.');
    err.textContent = ''; btn.disabled = true; btn.textContent = 'Đang tạo mã thanh toán…';
    api('POST', d).then(function (o) {
      if (!o.ok) throw new Error(o.error || 'Có lỗi, vui lòng thử lại.');
      if (o.alreadyOwned) { $('#libBtn').href = o.libraryUrl || 'thu-vien.html'; step(3); $('#s3 h3').textContent = 'Bạn đã sở hữu bộ tài liệu này'; return; }
      showQR(o);
      clearInterval(poll);
      poll = setInterval(function () {
        api('GET', { action: 'status', code: o.code }).then(function (s) {
          if (s.ok && s.status === 'Đã thanh toán') {
            clearInterval(poll); clearInterval(timer);
            $('#libBtn').href = s.libraryUrl; step(3);
            if (window.gtag) gtag('event', 'purchase', { transaction_id: o.code, value: o.amount, currency: 'VND' });
            if (window.fbq) fbq('track', 'Purchase', { value: o.amount, currency: 'VND' });
          } else if (s.ok && s.status === 'Thiếu tiền') {
            $('#waitTxt').innerHTML = 'Đã nhận một phần tiền. Vui lòng chuyển bổ sung đúng nội dung <b>' + o.code + '</b>.';
          }
        }).catch(function () {});
      }, 5000);
    }).catch(function (x) {
      if (x.message === 'NO_API') {           // chế độ dự phòng: QR tĩnh, xác nhận thủ công
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', code = 'TT';
        for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        var amt = PKGS[cur].price;
        showQR({ code: code, amount: amt, bank: T.BANK_LABEL, accountNo: T.ACCOUNT_NO, accountName: T.ACCOUNT_NAME,
          qr: 'https://img.vietqr.io/image/' + T.BANK_ID + '-' + T.ACCOUNT_NO + '-compact2.png?amount=' + amt + '&addInfo=' + code + '&accountName=' + encodeURIComponent(T.ACCOUNT_NAME) });
        $('#waitTxt').innerHTML = 'Sau khi chuyển khoản, chúng tôi xác nhận và mở tài liệu cho Gmail <b>' + d.email + '</b> trong giờ hành chính.';
      } else err.textContent = x.message || 'Không kết nối được máy chủ, vui lòng thử lại.';
    }).then(function () { btn.disabled = false; btn.textContent = 'Tiếp tục thanh toán'; });
  });


  // ---------- Tabs (trang mẫu, vai trò) ----------
  $$('.tabs').forEach(function (bar) {
    var tabs = $$('.tab', bar);
    tabs.forEach(function (t) { t.addEventListener('click', function () {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); var p = document.getElementById(x.getAttribute('data-tab')); if (p) p.hidden = !on; });
    }); });
  });
  // ---------- Phóng to ảnh mẫu ----------
  var lb = $('#lb');
  if (lb) {
    $$('[data-zoom]').forEach(function (b) { b.addEventListener('click', function () {
      $('#lbImg').src = b.getAttribute('data-zoom'); $('#lbImg').alt = b.getAttribute('data-cap') || ''; $('#lbCap').textContent = b.getAttribute('data-cap') || '';
      lb.hidden = false; document.body.style.overflow = 'hidden'; $('[data-lbclose]', lb).focus();
    }); });
    var lbClose = function () { lb.hidden = true; document.body.style.overflow = ''; };
    $('[data-lbclose]', lb).addEventListener('click', lbClose);
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') lbClose(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) lbClose(); });
  }
  // ---------- Trợ lý chọn gói ----------
  var ch = $('#chooser');
  if (ch) {
    var ans = {};
    var REC = {
      COMBO3: ['Combo 3 – 1.499.000đ', 'Đủ Sách lý thuyết, Checklist từng trẻ và Bộ giáo cụ để bắt đầu ngay trong tuần. Chỉ hơn Bộ đôi 100.000đ nhưng có thêm Checklist trị giá 299.000đ.', 'COMBO3'],
      FULL: ['Trọn bộ – 1.999.000đ', 'Combo 3 kèm 1 buổi đào tạo online (2 giờ) cùng chuyên gia: cách dạy âm, xếp lộ trình và kệ giáo cụ cho lớp. Nếu sau đó trường đăng ký Chuyển giao, 1.999.000đ được trừ lại.', 'FULL'],
      FEW: ['Trọn bộ cho trưởng nhóm, rồi Chuyển giao', 'Với 2–5 giáo viên, cách tiết kiệm là trưởng nhóm mua Trọn bộ để dự buổi đào tạo online, sau đó trường đăng ký Chuyển giao – khoản đã trả được trừ vào học phí.', 'FULL'],
      SCHOOL: ['Gói Chuyển giao nhà trường', '4 buổi đào tạo, slide chi tiết, giáo án Lesson Plan buổi sáng và buổi chiều, bản quyền cho mọi giáo viên – để mọi lớp dạy cùng một chuẩn.', 'LEAD']
    };
    var render = function () {
      if (!ans.role || !ans.kit || !ans.n) return;
      var r = ans.n === 'many' || (ans.role === 'ct' && ans.n === 'few') ? REC.SCHOOL : ans.n === 'few' ? REC.FEW : ans.kit === 'co' ? REC.FULL : REC.COMBO3;
      $('#chT').textContent = r[0]; $('#chP').textContent = r[1];
      $('#chB').innerHTML = r[2] === 'LEAD' ? '<a class="btn btn-white" href="#chuyen-giao">Xem Gói Chuyển giao</a>' : '<button class="btn btn-white" type="button" data-buy="' + r[2] + '">Chọn gói này</button>';
      var nb = $('#chB [data-buy]'); if (nb) nb.addEventListener('click', function (e) { e.preventDefault(); open(nb.getAttribute('data-buy')); });
    };
    $$('.opts', ch).forEach(function (g) {
      $$('button', g).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', function () {
        $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        ans[g.getAttribute('data-q')] = b.getAttribute('data-v'); render();
      }); });
    });
  }
  // ---------- Form đào tạo ----------
  var lf = $('#leadForm');
  if (lf) lf.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#leadErr'), b = lf.querySelector('button');
    var d = { action: 'lead', org: lf.org.value.trim(), name: lf.name.value.trim(), phone: lf.phone.value.trim(), email: lf.email.value.trim(), kind: lf.kind.value, note: lf.note.value.trim(), consent: lf.consent.checked };
    if (!d.org || !d.name) return (err.textContent = 'Vui lòng nhập tên đơn vị và người liên hệ.');
    if (d.phone.replace(/\D/g, '').length < 9) return (err.textContent = 'Số điện thoại chưa đúng.');
    if (!d.consent) return (err.textContent = 'Vui lòng đồng ý chính sách bảo mật.');
    err.textContent = ''; b.disabled = true;
    var done = function () { lf.hidden = true; $('#leadOk').hidden = false; };
    api('POST', d).then(function (o) { if (!o.ok) throw new Error(o.error); done(); })
      .catch(function (x) { if (x.message === 'NO_API') done(); else { err.textContent = x.message || 'Có lỗi, vui lòng thử lại.'; b.disabled = false; } });
  });
})();
