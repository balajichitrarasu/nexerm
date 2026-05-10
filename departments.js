// NexERM — Departments Page
window.renderDepartments = async function() {
  const [depts,emps] = await Promise.all([DB.getDepartments(),DB.getEmployees()]);
  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Departments</div><div class="page-sub">${depts.length} departments</div></div>
      <div class="page-header-actions"><button class="btn btn-primary" onclick="openAddDept()">+ Add Department</button></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
      ${depts.map(d=>{
        const count=emps.filter(e=>e.dept_id===d.id&&e.status==='Active').length;
        const head=emps.find(e=>e.id===d.head);
        return `<div class="card" style="border-top:3px solid ${d.color}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div style="font-family:var(--font-head);font-size:1rem;font-weight:800">${d.name}</div>
            <div style="display:flex;gap:6px">
              <button class="btn-icon" onclick="openEditDept('${d.id}')">✏️</button>
              <button class="btn-icon" onclick="deleteDept('${d.id}')">🗑️</button>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.82rem">
            <div><div style="color:var(--text3);margin-bottom:2px">Employees</div><div style="font-family:var(--font-head);font-size:1.3rem;font-weight:900;color:${d.color}">${count}</div></div>
            <div><div style="color:var(--text3);margin-bottom:2px">Head</div><div style="font-weight:600">${head?head.first+' '+head.last:'—'}</div></div>
          </div>
        </div>`;
      }).join('')||'<div class="empty-state"><div class="empty-icon">🏢</div><div class="empty-title">No departments yet</div></div>'}
    </div>`;
};

window.openAddDept = function() {
  openModal('Add Department', deptForm(), [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Add',cls:'btn-primary',action:async()=>{
      const name=val('df-name'),color=val('df-color');
      if(!name) return showToast('Enter department name','error');
      await DB.addDepartment({name,color:color||'#2563EB'});
      closeModal(); showToast('Department added','success');
      await loadGlobalData(); renderDepartments();
    }},
  ]);
};

window.openEditDept = async function(id) {
  const d=APP_STATE.departments.find(x=>x.id===id);
  openModal('Edit Department', deptForm(d), [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Save',cls:'btn-primary',action:async()=>{
      await DB.updateDepartment(id,{name:val('df-name'),color:val('df-color')});
      closeModal(); showToast('Department updated','success');
      await loadGlobalData(); renderDepartments();
    }},
  ]);
};

function deptForm(d={}) {
  return `<div class="form-group"><label>Department Name *</label><input class="form-input" id="df-name" value="${d.name||''}" placeholder="e.g. Engineering"></div>
  <div class="form-group"><label>Color</label><input type="color" class="form-input" id="df-color" value="${d.color||'#2563EB'}" style="height:42px;padding:4px"></div>`;
}

window.deleteDept = function(id) {
  const d=APP_STATE.departments.find(x=>x.id===id);
  confirmDialog(`Delete department <strong>${d?.name}</strong>?`, async()=>{
    await DB.deleteDepartment(id); showToast('Deleted','info');
    await loadGlobalData(); renderDepartments();
  });
};
