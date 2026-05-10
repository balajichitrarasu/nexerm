// NexERM — Auth (Supabase Auth + localStorage demo)

async function init() {
  await initSupabase();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) { window.location.href = 'pages/app.html'; return; }
  } else {
    const demo = localStorage.getItem('nexerm_session');
    if (demo) { window.location.href = 'pages/app.html'; return; }
  }
  // Show date
  document.getElementById('currentDate') && (document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}));
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pwd   = document.getElementById('loginPassword').value;
  if (!email || !pwd) return showToast('Enter email and password','error');
  const btn = document.getElementById('loginBtnText');
  btn.textContent = 'Signing in...';
  try {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error) throw error;
      window.location.href = 'pages/app.html';
    } else {
      // Demo mode — accept any non-empty credentials
      if (pwd.length < 3) throw new Error('Password too short');
      localStorage.setItem('nexerm_session', JSON.stringify({ email, name: email.split('@')[0], role: 'Admin' }));
      window.location.href = 'pages/app.html';
    }
  } catch(e) {
    showToast(e.message || 'Login failed','error');
    btn.textContent = 'Sign In';
  }
}

async function handleRegister() {
  const first   = document.getElementById('regFirst').value.trim();
  const last    = document.getElementById('regLast').value.trim();
  const company = document.getElementById('regCompany').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const pwd     = document.getElementById('regPassword').value;
  if (!first || !email || !pwd || !company) return showToast('Fill all fields','error');
  if (pwd.length < 8) return showToast('Password must be 8+ characters','error');
  try {
    if (supabase) {
      const { error } = await supabase.auth.signUp({ email, password: pwd, options: { data: { first_name: first, last_name: last, company } } });
      if (error) throw error;
      showToast('Account created! Check your email to confirm.','success');
      showLogin();
    } else {
      localStorage.setItem('nexerm_session', JSON.stringify({ email, name: `${first} ${last}`, company, role: 'Admin' }));
      window.location.href = 'pages/app.html';
    }
  } catch(e) { showToast(e.message||'Registration failed','error'); }
}

async function handleForgot() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return showToast('Enter your email','error');
  try {
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    }
    showToast('Reset link sent to '+email,'success');
    showLogin();
  } catch(e) { showToast(e.message||'Error','error'); }
}

function showLogin()    { el('loginForm').style.display=''; el('registerForm').style.display='none'; el('forgotForm').style.display='none'; }
function showRegister() { el('loginForm').style.display='none'; el('registerForm').style.display=''; el('forgotForm').style.display='none'; }
function showForgot()   { el('loginForm').style.display='none'; el('registerForm').style.display='none'; el('forgotForm').style.display=''; }
function el(id) { return document.getElementById(id); }

let _toast_timer=null;
function showToast(msg, type='info') {
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.className=`toast ${type} show`;
  clearTimeout(_toast_timer);
  _toast_timer=setTimeout(()=>{ t.className='toast'; },3200);
}

document.addEventListener('DOMContentLoaded', init);
