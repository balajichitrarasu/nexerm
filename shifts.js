// NexERM — Shifts Page
window.renderShifts = async function() {
  const [shifts,emps] = await Promise.all([DB.getShifts(),DB.getEmployees()]);
  APP_STATE.shifts=shifts;

  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Shift Manager</div><div class="page-sub">${shifts.length} shifts configured</div></div>
      <div class="page-header-actions"><button class="btn btn-primary" onclick="openAddShift()">+ New Shift</button></div>
    </div>

    <div class="shift-grid">
      ${shifts.map(s=>{
        const assigned=emps.filter(e=>e.shift_id===s.id&&e.status==='Active');
        return `<div class="shift-card">
          <div class="shift-card-stripe" style="background:${s.color}"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div class="shift-card-name">${s.name}</div>
            <div style="display:flex;gap:5px">
              <button class="btn-icon" onclick="openEditShift('${s.id}')">✏️</button>
              <button class="btn-icon" onclick="deleteShift('${s.id}')">🗑️</button>
            </div>
          </div>
          <div class="shift-card-time">⏰ ${s.start} – ${s.end} · <span style="color:${s.color};font-weight:700">${assigned.length} staff</span></div>
          <div class="shift-emp-list">
            ${assigned.slice(0,5).map(e=>`
              <div class="shift-emp-row">
                ${empAvatar(e,26)}
                <div class="shift-emp-info">
                  <div class="shift-emp-name">${e.first} ${e.last}</div>
                  <div class="shift-emp-role">${e.role||'—'}</div>
                </div>
              </div>`).join('')}
            ${assigned.length>5?`<div style="font-size:0.78rem;color:var(--text3);padding:6px 10px">+${assigned.length-5} more</div>`:''}
            ${!assigned.length?'<div style="font-size:0.82rem;color:var(--text3);padding:8px">No employees assigned</div>':''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Assign / Reassign Shifts</div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Employee</th><th>Current Shift</th><th>Reassign To</th><th>Action</th></tr></thead>
          <tbody>
            ${emps.filter(e=>e.status==='Active').map(e=>{
              const cur=shifts.find(s=>s.id===e.shift_id);
              const opts=shifts.map(s=>`<option value="${s.id}" ${s.id===e.shift_id?'selected':''}>${s.name}</option>`).join('');
              return `<tr>
                <td><div style="display:flex;align-items:center;gap:8px">${empAvatar(e,28)}<div><div style="font-weight:600;color:var(--text)">${e.first} ${e.last}</div><div style="font-size:0.75rem;color:var(--text3)">${e.role||''}</div></div></div></td>
                <td>${cur?shiftBadge(cur):'—'}</td>
                <td><select class="filter-input" id="reassign-${e.id}">${opts}</select></td>
                <td><button class="btn btn-primary btn-xs" onclick="doReassign('${e.id}')">Apply</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
};

window.doReassign = async function(empId) {
  const newShift=val('reassign-'+empId);
  await DB.updateEmployee(empId,{shift_id:newShift});
  showToast('Shift updated','success');
  await loadGlobalData(); renderShifts();
};

function shiftFormHtml(s={}) {
  return `<div class="form-row">
    <div class="form-group"><label>Shift Name *</label><input class="form-input" id="sf-name" value="${s.name||''}" placeholder="e.g. Morning"></div>
    <div class="form-group"><label>Color</label><input type="color" class="form-input" id="sf-color" value="${s.color||'#2563EB'}" style="height:42px;padding:4px"></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label>Start Time *</label><input type="time" class="form-input" id="sf-start" value="${s.start||'09:00'}"></div>
    <div class="form-group"><label>End Time *</label><input type="time" class="form-input" id="sf-end" value="${s.end||'18:00'}"></div>
  </div>`;
}

window.openAddShift = function() {
  openModal('Add Shift', shiftFormHtml(), [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Add Shift',cls:'btn-primary',action:async()=>{
      const name=val('sf-name');
      if(!name) return showToast('Enter shift name','error');
      await DB.addShift({name,color:val('sf-color'),start:val('sf-start'),end:val('sf-end')});
      closeModal(); showToast('Shift added','success');
      await loadGlobalData(); renderShifts();
    }},
  ]);
};

window.openEditShift = function(id) {
  const s=APP_STATE.shifts.find(x=>x.id===id);
  openModal('Edit Shift — '+s.name, shiftFormHtml(s), [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Save',cls:'btn-primary',action:async()=>{
      await DB.updateShift(id,{name:val('sf-name'),color:val('sf-color'),start:val('sf-start'),end:val('sf-end')});
      closeModal(); showToast('Shift updated','success');
      await loadGlobalData(); renderShifts();
    }},
  ]);
};

window.deleteShift = function(id) {
  const s=APP_STATE.shifts.find(x=>x.id===id);
  confirmDialog(`Delete shift <strong>${s?.name}</strong>?`, async()=>{
    await DB.deleteShift(id); showToast('Deleted','info');
    await loadGlobalData(); renderShifts();
  });
};
