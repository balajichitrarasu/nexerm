// NexERM — Leaves Page
window.renderLeaves = async function() {
  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Leave Requests</div><div class="page-sub">Manage employee leave applications</div></div>
      <div class="page-header-actions"><button class="btn btn-primary" onclick="openApplyLeave()">+ Apply Leave</button></div>
    </div>
    <div class="filter-bar">
      <div class="filter-group">
        <select class="filter-input" id="lvStatusF"><option value="">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
        <select class="filter-input" id="lvTypeF"><option value="">All Types</option><option>Sick Leave</option><option>Casual Leave</option><option>Annual Leave</option><option>Emergency Leave</option><option>Maternity Leave</option><option>Paternity Leave</option></select>
      </div>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="lvTbody"></tbody>
    </table></div>`;
  el('lvStatusF').addEventListener('change',loadLeaveTable);
  el('lvTypeF').addEventListener('change',loadLeaveTable);
  await loadLeaveTable();
};

async function loadLeaveTable() {
  const status=val('lvStatusF'), type=val('lvTypeF');
  let leaves=await DB.getLeaves({status:status||undefined});
  if(type) leaves=leaves.filter(l=>l.type===type);
  const emps=APP_STATE.employees;
  el('lvTbody').innerHTML=leaves.length?leaves.map(l=>{
    const emp=emps.find(e=>e.id===l.emp_id)||{first:'?',last:''};
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px">${empAvatar(emp,28)}<div style="font-weight:600;color:var(--text)">${emp.first} ${emp.last}</div></div></td>
      <td><span class="badge badge-blue">${l.type}</span></td>
      <td>${fmtDate(l.from_date)}</td>
      <td>${fmtDate(l.to_date)}</td>
      <td style="font-weight:700;color:var(--text)">${l.days}</td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${l.reason}">${l.reason||'—'}</td>
      <td style="color:var(--text3)">${fmtDate(l.applied_on)}</td>
      <td>${statusBadge(l.status)}</td>
      <td><div class="td-actions">
        ${l.status==='Pending'?`<button class="btn btn-success btn-xs" onclick="approveLeave('${l.id}')">Approve</button><button class="btn btn-danger btn-xs" onclick="rejectLeave('${l.id}')">Reject</button>`:''}
        <button class="btn btn-danger btn-xs" onclick="deleteLeaveReq('${l.id}')">Del</button>
      </div></td>
    </tr>`;
  }).join(''):`<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🏖️</div><div class="empty-title">No leave records</div></div></td></tr>`;
}

window.approveLeave = async function(id) {
  const l=(await DB.getLeaves()).find(x=>x.id===id);
  await DB.updateLeave(id,{status:'Approved'});
  // mark attendance as On Leave for each day
  if(l) {
    const from=new Date(l.from_date), to=new Date(l.to_date);
    for(let d=new Date(from);d<=to;d.setDate(d.getDate()+1)) {
      const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      await DB.upsertAttendance({date:ds,emp_id:l.emp_id,check_in:null,check_out:null,status:'On Leave',overtime_hrs:0,note:'Leave approved'});
    }
  }
  await DB.logActivity('Leave approved','',  '#10B981');
  showToast('Leave approved','success');
  await loadNotifications(); await loadLeaveTable();
};

window.rejectLeave = async function(id) {
  await DB.updateLeave(id,{status:'Rejected'});
  showToast('Leave rejected','info');
  await loadNotifications(); await loadLeaveTable();
};

window.deleteLeaveReq = function(id) {
  confirmDialog('Delete this leave record?', async()=>{
    await DB.deleteLeave(id); showToast('Deleted','info'); await loadLeaveTable();
  });
};

window.openApplyLeave = function() {
  const empOpts=APP_STATE.employees.filter(e=>e.status==='Active').map(e=>`<option value="${e.id}">${e.first} ${e.last} (${e.id})</option>`).join('');
  openModal('Apply Leave', `
    <div class="form-group"><label>Employee *</label><select class="form-select" id="lf-emp"><option value="">Select employee</option>${empOpts}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Leave Type *</label>
        <select class="form-select" id="lf-type">
          <option>Sick Leave</option><option>Casual Leave</option><option>Annual Leave</option>
          <option>Emergency Leave</option><option>Maternity Leave</option><option>Paternity Leave</option>
        </select>
      </div>
      <div class="form-group"><label>No. of Days</label><input type="number" class="form-input" id="lf-days" value="1" min="1"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>From Date *</label><input type="date" class="form-input" id="lf-from" value="${todayStr()}"></div>
      <div class="form-group"><label>To Date *</label><input type="date" class="form-input" id="lf-to" value="${todayStr()}"></div>
    </div>
    <div class="form-group"><label>Reason *</label><textarea class="form-textarea" id="lf-reason" placeholder="Reason for leave..."></textarea></div>`,
  [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Submit',cls:'btn-primary',action:async()=>{
      const emp_id=val('lf-emp'),type=val('lf-type'),from_date=val('lf-from'),to_date=val('lf-to'),reason=val('lf-reason');
      if(!emp_id||!from_date||!to_date||!reason) return showToast('Fill all fields','error');
      const days=parseInt(val('lf-days'))||1;
      await DB.addLeave({emp_id,type,from_date,to_date,days,reason,status:'Pending',applied_on:todayStr()});
      closeModal(); showToast('Leave request submitted','success');
      await loadNotifications(); await loadLeaveTable();
    }},
  ]);
};
