(function() {
  var appHtml = '<div class="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800">' +
    '<div class="max-w-7xl mx-auto bg-teal-700 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 mb-6">' +
      '<div class="flex items-center gap-3">' +
        '<div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">🏫</div>' +
        '<div>' +
          '<h1 class="text-xl font-extrabold tracking-wide">MI NAJMUL KHOIR</h1>' +
          '<p class="text-xs text-teal-100">Sistem Informasi Manajemen & Presensi Digital</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex items-center gap-2">' +
        '<span id="txtUserAccess" class="bg-teal-800 text-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-600">Akses: Admin</span>' +
      '</div>' +
    '</div>' +

    '<div class="max-w-7xl mx-auto space-y-6">' +
      '<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">' +
        '<div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" id="classListContainer"></div>' +
        '<div class="flex items-center gap-2 w-full md:w-auto">' +
          '<button onclick="changeMode(\'daily\')" id="btnModeDaily" class="flex-1 md:flex-none px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow">Harian</button>' +
          '<button onclick="changeMode(\'recap\')" id="btnModeRecap" class="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200">Rekap</button>' +
        '</div>' +
      '</div>' +

      '<div id="viewDaily" class="space-y-6">' +
        '<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">' +
          '<div class="flex items-center gap-3">' +
            '<label class="text-xs font-bold text-slate-500 uppercase">Tanggal:</label>' +
            '<input type="date" id="inputDate" onchange="loadAttendance()" class="bg-slate-100 px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200">' +
          '</div>' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<button onclick="markAllHadir()" class="px-3 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-200">Semua Hadir</button>' +
            '<button onclick="openAddModal()" class="px-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700">+ Tambah Siswa</button>' +
          '</div>' +
        '</div>' +

        '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">' +
          '<div class="p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-sm text-slate-700">' +
            'Daftar Siswa - <span id="lblActiveClass" class="text-teal-700">Kelas 1 A</span>' +
          '</div>' +
          '<div class="overflow-x-auto">' +
            '<table class="w-full text-left border-collapse">' +
              '<thead>' +
                '<tr class="bg-slate-100 text-slate-500 text-[11px] font-extrabold uppercase border-b border-slate-200">' +
                  '<th class="p-3 w-12 text-center">No</th>' +
                  '<th class="p-3">NISN / Nama</th>' +
                  '<th class="p-3 text-center">Status Kehadiran</th>' +
                  '<th class="p-3">Catatan</th>' +
                  '<th class="p-3 text-center w-16">Aksi</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="tblSiswaBody" class="divide-y divide-slate-100 text-sm"></tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div id="viewRecap" style="display:none;" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">' +
        '<div class="text-center pb-4 border-b border-slate-200">' +
          '<h2 class="text-lg font-black text-slate-800">REKAP PRESENSI SISWA</h2>' +
          '<p class="text-xs text-slate-500 font-bold" id="recapSubTitle">MI NAJMUL KHOIR</p>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
          '<table class="w-full text-left border-collapse border border-slate-200">' +
            '<thead>' +
              '<tr class="bg-slate-100 text-xs uppercase font-extrabold border-b border-slate-200">' +
                '<th class="p-2 border text-center">No</th>' +
                '<th class="p-2 border">NISN</th>' +
                '<th class="p-2 border">Nama Siswa</th>' +
                '<th class="p-2 border text-center text-emerald-700 bg-emerald-50">Hadir</th>' +
                '<th class="p-2 border text-center text-amber-700 bg-amber-50">Sakit</th>' +
                '<th class="p-2 border text-center text-blue-700 bg-blue-50">Izin</th>' +
                '<th class="p-2 border text-center text-rose-700 bg-rose-50">Alpa</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="tblRecapBody" class="text-xs divide-y divide-slate-200"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  var root = document.getElementById('absensi-app-root');
  if (root) root.innerHTML = appHtml;

  var allClasses = ['1a', '1b', '2', '3', '4', '5', '6'];
  var currentUser = JSON.parse(localStorage.getItem('mnk_session') || '{"role":"admin","kelas":"all"}');
  var currentClass = (currentUser.kelas && currentUser.kelas !== 'all') ? currentUser.kelas : '1a';
  var students = JSON.parse(localStorage.getItem('mnk_master_students') || '{}');

  if (Object.keys(students).length === 0) {
    students = {
      '1a': [{ id: '1a-1', nisn: '00101', nama: 'Ahmad Fauzi' }],
      '1b': [{ id: '1b-1', nisn: '00102', nama: 'Budi Santoso' }],
      '2':  [{ id: '2-1', nisn: '00201', nama: 'Citra Kirana' }],
      '3':  [{ id: '3-1', nisn: '00301', nama: 'Doni Tata' }],
      '4':  [{ id: '4-1', nisn: '00401', nama: 'Eka Wijaya' }],
      '5':  [{ id: '5-1', nisn: '00501', nama: 'Fajar Sadboy' }],
      '6':  [{ id: '6-1', nisn: '00601', nama: 'Gita Gutawa' }]
    };
    localStorage.setItem('mnk_master_students', JSON.stringify(students));
  }

  window.initApp = function() {
    var inpDate = document.getElementById('inputDate');
    if (inpDate) inpDate.value = new Date().toISOString().split('T')[0];
    
    var txtAccess = document.getElementById('txtUserAccess');
    if (txtAccess) {
      if (currentUser.role === 'admin' || currentUser.kelas === 'all') {
        txtAccess.innerText = 'Akses: Semua Kelas (Admin)';
      } else {
        txtAccess.innerText = 'Akses: Wali Kelas ' + currentUser.kelas.toUpperCase();
      }
    }

    renderTabs();
    loadAttendance();
  };

  window.renderTabs = function() {
    var container = document.getElementById('classListContainer');
    if (!container) return;
    container.innerHTML = '';

    var visibleClasses = (currentUser.kelas && currentUser.kelas !== 'all') ? [currentUser.kelas] : allClasses;

    visibleClasses.forEach(function(cls) {
      var btn = document.createElement('button');
      btn.className = 'px-4 py-2 rounded-xl font-extrabold text-xs transition-all ' + 
        (cls === currentClass ? 'bg-teal-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200');
      
      var label = cls.length === 2 ? 'Kelas ' + cls.charAt(0) + ' ' + cls.charAt(1).toUpperCase() : 'Kelas ' + cls;
      btn.innerText = label;
      
      btn.onclick = function() {
        currentClass = cls;
        var lbl = document.getElementById('lblActiveClass');
        if (lbl) lbl.innerText = label;
        renderTabs();
        loadAttendance();
      };
      container.appendChild(btn);
    });

    var activeLabel = currentClass.length === 2 ? 'Kelas ' + currentClass.charAt(0) + ' ' + currentClass.charAt(1).toUpperCase() : 'Kelas ' + currentClass;
    var lblActive = document.getElementById('lblActiveClass');
    if (lblActive) lblActive.innerText = activeLabel;
  };

  window.loadAttendance = function() {
    var inpDate = document.getElementById('inputDate');
    var date = inpDate ? inpDate.value : new Date().toISOString().split('T')[0];
    var key = 'mnk_att_' + date + '_' + currentClass;
    var record = JSON.parse(localStorage.getItem(key) || '{}');

    var list = students[currentClass] || [];
    var tbody = document.getElementById('tblSiswaBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-400">Belum ada data siswa di kelas ini.</td></tr>';
      return;
    }

    list.forEach(function(s, idx) {
      var st = record[s.id] ? record[s.id].status : 'Hadir';
      var note = record[s.id] ? record[s.id].note : '';

      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="p-3 text-center text-slate-400 font-bold">' + (idx + 1) + '</td>' +
        '<td class="p-3"><div class="font-bold text-slate-800">' + s.nama + '</div><div class="text-[10px] text-slate-400">NISN: ' + s.nisn + '</div></td>' +
        '<td class="p-3 text-center">' +
          '<div class="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">' +
            '<button onclick="setStatus(\'' + s.id + '\', \'Hadir\')" class="px-2.5 py-1 text-xs font-bold rounded-lg ' + (st === 'Hadir' ? 'bg-emerald-600 text-white' : 'text-slate-500') + '">Hadir</button>' +
            '<button onclick="setStatus(\'' + s.id + '\', \'Sakit\')" class="px-2.5 py-1 text-xs font-bold rounded-lg ' + (st === 'Sakit' ? 'bg-amber-500 text-white' : 'text-slate-500') + '">Sakit</button>' +
            '<button onclick="setStatus(\'' + s.id + '\', \'Izin\')" class="px-2.5 py-1 text-xs font-bold rounded-lg ' + (st === 'Izin' ? 'bg-blue-600 text-white' : 'text-slate-500') + '">Izin</button>' +
            '<button onclick="setStatus(\'' + s.id + '\', \'Alpa\')" class="px-2.5 py-1 text-xs font-bold rounded-lg ' + (st === 'Alpa' ? 'bg-rose-600 text-white' : 'text-slate-500') + '">Alpa</button>' +
          '</div>' +
        '</td>' +
        '<td class="p-3"><input type="text" value="' + note + '" onchange="setNote(\'' + s.id + '\', this.value)" placeholder="Ket..." class="w-full bg-slate-50 px-2.5 py-1 border rounded-lg text-xs"></td>' +
        '<td class="p-3 text-center"><button onclick="delStudent(\'' + s.id + '\')" class="text-rose-500 hover:text-rose-700 font-bold"><i class="fa-solid fa-trash"></i></button></td>';
      tbody.appendChild(tr);
    });
  };

  window.setStatus = function(id, st) {
    var date = document.getElementById('inputDate').value;
    var key = 'mnk_att_' + date + '_' + currentClass;
    var record = JSON.parse(localStorage.getItem(key) || '{}');
    if (!record[id]) record[id] = {};
    record[id].status = st;
    localStorage.setItem(key, JSON.stringify(record));
    loadAttendance();
  };

  window.setNote = function(id, note) {
    var date = document.getElementById('inputDate').value;
    var key = 'mnk_att_' + date + '_' + currentClass;
    var record = JSON.parse(localStorage.getItem(key) || '{}');
    if (!record[id]) record[id] = {};
    record[id].note = note;
    localStorage.setItem(key, JSON.stringify(record));
  };

  window.markAllHadir = function() {
    var date = document.getElementById('inputDate').value;
    var key = 'mnk_att_' + date + '_' + currentClass;
    var record = {};
    (students[currentClass] || []).forEach(function(s) {
      record[s.id] = { status: 'Hadir', note: '' };
    });
    localStorage.setItem(key, JSON.stringify(record));
    loadAttendance();
  };

  window.delStudent = function(id) {
    if(!confirm("Yakin ingin menghapus siswa ini?")) return;
    students[currentClass] = (students[currentClass] || []).filter(function(s){ return s.id !== id; });
    localStorage.setItem('mnk_master_students', JSON.stringify(students));
    loadAttendance();
  };

  window.openAddModal = function() {
    var nama = prompt("Masukkan Nama Siswa Baru:");
    if (!nama) return;
    var nisn = prompt("Masukkan NISN Siswa:") || "00000";
    
    if(!students[currentClass]) students[currentClass] = [];
    students[currentClass].push({
      id: currentClass + '-' + Date.now(),
      nisn: nisn,
      nama: nama
    });
    localStorage.setItem('mnk_master_students', JSON.stringify(students));
    loadAttendance();
  };

  window.changeMode = function(m) {
    document.getElementById('viewDaily').style.display = m === 'daily' ? 'block' : 'none';
    document.getElementById('viewRecap').style.display = m === 'recap' ? 'block' : 'none';
    document.getElementById('btnModeDaily').className = m === 'daily' ? 'flex-1 md:flex-none px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow' : 'flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200';
    document.getElementById('btnModeRecap').className = m === 'recap' ? 'flex-1 md:flex-none px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow' : 'flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200';
    if (m === 'recap') renderRecap();
  };

  window.renderRecap = function() {
    var tbody = document.getElementById('tblRecapBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var list = students[currentClass] || [];

    list.forEach(function(s, idx) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="p-2 border text-center font-bold">' + (idx + 1) + '</td>' +
        '<td class="p-2 border font-mono">' + s.nisn + '</td>' +
        '<td class="p-2 border font-bold">' + s.nama + '</td>' +
        '<td class="p-2 border text-center font-bold bg-emerald-50 text-emerald-800">100%</td>' +
        '<td class="p-2 border text-center font-bold bg-amber-50 text-amber-800">0</td>' +
        '<td class="p-2 border text-center font-bold bg-blue-50 text-blue-800">0</td>' +
        '<td class="p-2 border text-center font-bold bg-rose-50 text-rose-800">0</td>';
      tbody.appendChild(tr);
    });
  };

  setTimeout(initApp, 200);
})();