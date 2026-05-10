// NexERM — Main App Controller

let APP_STATE = {
  user: null,
  employees: [],
  departments: [],
  shifts: [],
  settings: {},
  currentPage: 'dashboard',
};

async function checkAuth() {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '../index.html'; return false; }
    APP_STATE.user = session.user;
    return true;
  } else {
    const demo = localStorage.getItem('nexerm_session');
    if (!demo) { window.location.href = '../index.html'; return false; }
    APP_STATE.user = JSON.parse(demo);
    return true;
  }
}

async function handleLogout() {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem('nexerm_session');
  window.location.href = '../index.html';
}

async function loadGlobalData() {
  const [emps, depts, shifts, settings] = await Promise.all([
    DB.getEmployees(),
    DB.getDepartments(),
    DB.getShifts(),
    DB.getSettings(),
  ]);
  APP_STATE.employees   = emps;
  APP_STATE.departments = depts;
  APP_STATE.shifts      = shifts;
  APP_STATE.settings    = settings;
}

function renderSidebarUser() {
  const u = APP_STATE.user;
  const name = u.name || u.user_metadata?.first_name || u.email?.split('@')[0] || 'Admin';
  const role = 'HR Admin';
  const ini  = name.slice(0,2).toUpperCase();
  el('userName').textContent  = name;
  el('userRole').textContent  = role;
  el('userAvatar').textContent= ini;
  el('sidebarCompany').textContent = APP_STATE.settings?.company_name || 'Your Company';
}

function navigate(page) {
  APP_STATE.currentPage = page;
  document.querySelectorAll('.nav-link').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  const names={dashboard:'Dashboard',employees:'Employees',departments:'Departments',shifts:'Shift Manager',attendance:'Attendance',leaves:'Leave Requests',payroll:'Payroll',reports:'Reports',settings:'Settings'};
  el('breadcrumbPage').textContent = names[page]||page;
  el('pageArea').innerHTML = `<div class="page-loading"><div class="spinner"></div></div>`;
  const renderers = {
    dashboard:   window.renderDashboard,
    employees:   window.renderEmployees,
    departments: window.renderDepartments,
    shifts:      window.renderShifts,
    attendance:  window.renderAttendance,
    leaves:      window.renderLeaves,
    payroll:     window.renderPayroll,
    reports:     window.renderReports,
    settings:    window.renderSettings,
  };
  const fn = renderers[page];
  if (fn) {
    Promise.resolve(fn()).catch(e=>{ console.error(e); el('pageArea').innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Error loading page</div><div class="empty-sub">${e.message}</div></div>`; });
  } else {
    el('pageArea').innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><div class="empty-title">Page not found</div></div>`;
  }
  closeSidebar();
}

function openSidebar()  { el('sidebar').classList.add('open'); el('sidebarOverlay').classList.add('open'); }
function closeSidebar() { el('sidebar').classList.remove('open'); el('sidebarOverlay').classList.remove('open'); }

function toggleNotif() {
  const panel = el('notifPanel');
  panel.style.display = panel.style.display==='none' ? 'block' : 'none';
}

async function loadNotifications() {
  const leaves = await DB.getLeaves({status:'Pending'});
  const notifList = el('notifList');
  if (!notifList) return;
  if (!leaves.length) { notifList.innerHTML='<div class="notif-item">No new notifications</div>'; el('notifDot').style.display='none'; return; }
  el('notifDot').style.display='block';
  notifList.innerHTML = leaves.slice(0,5).map(l=>{
    const emp=APP_STATE.employees.find(e=>e.id===l.emp_id);
    return `<div class="notif-item"><strong>Leave Request</strong>${fullName(emp||{first:'?',last:''})} · ${l.type}<br><small>${l.from_date}</small></div>`;
  }).join('');
}

function fullName(emp) { return (emp?.first||'')+' '+(emp?.last||''); }
function el(id) { return document.getElementById(id); }

document.addEventListener('DOMContentLoaded', async () => {
  await initSupabase();
  const ok = await checkAuth();
  if (!ok) return;

  await DB.init();
  await loadGlobalData();
  renderSidebarUser();

  // Topbar date
  el('topbarDate').textContent = new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});

  // Nav
  document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click', e=>{ e.preventDefault(); navigate(link.dataset.page); });
  });

  el('menuToggle').addEventListener('click', openSidebar);
  el('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('modalBackdrop').addEventListener('click', e=>{
    if(e.target===document.getElementById('modalBackdrop')) closeModal();
  });

  // Global search
  el('globalSearch').addEventListener('input', debounce(async e=>{
    if(APP_STATE.currentPage==='employees') {
      APP_STATE.employees = await DB.getEmployees({search:e.target.value});
      window.renderEmployees && window.renderEmployees();
    }
  },300));

  // Close notif on outside click
  document.addEventListener('click', e=>{
    if(!e.target.closest('.notif-wrap')) el('notifPanel').style.display='none';
  });

  await loadNotifications();
  navigate('dashboard');
});
