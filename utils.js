// NexERM — Utilities

function todayStr() {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmtDate(str) {
  if(!str) return '—';
  const d=new Date(str+'T00:00:00');
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

function fmtMoney(n) {
  return NEXERM_CONFIG.CURRENCY_SYMBOL + Math.round(n||0).toLocaleString(NEXERM_CONFIG.CURRENCY_LOCALE);
}

function fmtNum(n) { return Math.round(n||0).toLocaleString('en-IN'); }

function initials(first, last) {
  return ((first||'')[0]||'')+''+((last||'')[0]||'');
}

function fullName(emp) { return (emp.first||'')+' '+(emp.last||''); }

function avatarColor(str) {
  const colors=['#2563EB','#10B981','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#EC4899','#14B8A6'];
  let hash=0; for(let c of (str||'')) hash=c.charCodeAt(0)+((hash<<5)-hash);
  return colors[Math.abs(hash)%colors.length];
}

function calcHours(checkIn, checkOut) {
  if(!checkIn||!checkOut) return 0;
  const [ih,im]=checkIn.split(':').map(Number);
  const [oh,om]=checkOut.split(':').map(Number);
  let diff=(oh*60+om)-(ih*60+im);
  if(diff<0) diff+=24*60;
  return diff/60;
}

function daysInMonth(year, month) {
  return new Date(year, month+1, 0).getDate();
}

function workDaysInMonth(year, month) {
  let count=0;
  const days=daysInMonth(year,month);
  for(let d=1;d<=days;d++){
    const dow=new Date(year,month,d).getDay();
    if(dow!==0&&dow!==6) count++;
  }
  return count;
}

function getShiftById(shifts, id) { return shifts.find(s=>s.id===id)||null; }
function getDeptById(depts, id) { return depts.find(d=>d.id===id)||null; }

function empAvatar(emp, size=34) {
  const bg = avatarColor(emp.id);
  const ini = initials(emp.first, emp.last).toUpperCase();
  return `<div class="emp-avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${Math.round(size*0.35)}px">${ini}</div>`;
}

function shiftBadge(shift) {
  if(!shift) return '<span class="badge badge-gray">—</span>';
  const style=`background:${shift.color}22;color:${shift.color};border:1px solid ${shift.color}44`;
  return `<span class="badge" style="${style}">${shift.name}</span>`;
}

function statusBadge(status) {
  const map={
    'Active':'badge-green','Inactive':'badge-red',
    'Present':'badge-green','Absent':'badge-red','On Leave':'badge-amber','Late':'badge-purple','Half Day':'badge-cyan',
    'Pending':'badge-amber','Approved':'badge-green','Rejected':'badge-red',
    'Paid':'badge-green','Processing':'badge-amber','Hold':'badge-red',
  };
  return `<span class="badge ${map[status]||'badge-gray'}">${status}</span>`;
}

let _toast_timer=null;
function showToast(msg, type='info') {
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg; el.className=`toast ${type} show`;
  clearTimeout(_toast_timer);
  _toast_timer=setTimeout(()=>{ el.className='toast'; },3200);
}

function openModal(title, body, buttons=[], opts={}) {
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=body;
  const foot=document.getElementById('modalFoot');
  foot.innerHTML='';
  buttons.forEach(b=>{
    const btn=document.createElement('button');
    btn.className='btn '+(b.cls||'btn-secondary');
    btn.textContent=b.label;
    btn.onclick=b.action;
    foot.appendChild(btn);
  });
  const box=document.getElementById('modalBox');
  box.className='modal-box'+(opts.size?' modal-'+opts.size:'');
  document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

function confirmDialog(message, onConfirm, confirmLabel='Delete', confirmCls='btn-danger') {
  openModal('Confirm', `<p style="color:var(--text2);font-size:0.9rem;line-height:1.6">${message}</p>`, [
    {label:'Cancel',   cls:'btn-secondary',action:closeModal},
    {label:confirmLabel,cls:confirmCls,    action:async()=>{ closeModal(); await onConfirm(); }},
  ], {size:'sm'});
}

function val(id) { const el=document.getElementById(id); return el?el.value.trim():''; }
function setVal(id, v) { const el=document.getElementById(id); if(el) el.value=v||''; }
function el(id) { return document.getElementById(id); }

function debounce(fn, delay=300) {
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),delay); };
}

function exportCSV(rows, filename) {
  if(!rows.length) return showToast('No data to export','warn');
  const headers=Object.keys(rows[0]);
  const csv=[headers.join(','),...rows.map(r=>headers.map(h=>{
    const v=String(r[h]||'').replace(/"/g,'""');
    return v.includes(',')||v.includes('"')?`"${v}"`:v;
  }).join(','))].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download=filename; a.click();
  showToast('CSV exported','success');
}

function exportJSON(data, filename) {
  const a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(data,null,2));
  a.download=filename; a.click();
  showToast('JSON exported','success');
}
