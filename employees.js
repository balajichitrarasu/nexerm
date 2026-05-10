// NexERM — Employees Page

window.renderEmployees = async function() {
  const [emps,depts,shifts] = await Promise.all([DB.getEmployees(),DB.getDepartments(),DB.getShifts()]);
  APP_STATE.employees=emps; APP_STATE.departments=depts; APP_STATE.shifts=shifts;

  const deptOpts = depts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');
  const shiftOpts = shifts.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');

  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <div class="page-title-lg">Employees</div>
        <div class="page-sub">${emps.filter(e=>e.status==='Active').length} active · ${emps.filter(e=>e.status==='Inactive').length} inactive</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" onclick="exportCSV(getEmpExportData(),'employees.csv')">⬇ Export</button>
        <button class="btn btn-primary" onclick="openAddEmployee()">+ Add Employee</button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <input type="text" class="filter-input" id="empSearch" placeholder="Search name, ID, email..." style="flex:1;min-width:160px">
        <select class="filter-input" id="empDeptFilter"><option value="">All Departments</option>${deptOpts}</select>
        <select class="filter-input" id="empShiftFilter"><option value="">All Shifts</option>${shiftOpts}</select>
        <select class="filter-input" id="empStatusFilter"><option value="">All Status</option><option>Active</option><option>Inactive</option></select>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary btn-sm" onclick="applyEmpFilters()">Filter</button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table" id="empTable">
        <thead><tr>
          <th>Employee</th><th>Department</th><th>Shift</th><th>Role</th>
          <th>Salary/Day</th><th>Join Date</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody id="empTbody">${buildEmpRows(emps,depts,shifts)}</tbody>
      </table>
    </div>`;

  el('empSearch').addEventListener('input', debounce(applyEmpFilters,300));
  el('empDeptFilter').addEventListener('change', applyEmpFilters);
  el('empShiftFilter').addEventListener('change', applyEmpFilters);
  el('empStatusFilter').addEventListener('change', applyEmpFilters);

  window.getEmpExportData = ()=>emps.map(e=>({
    ID:e.id,First:e.first,Last:e.last,Email:e.email,Phone:e.phone,
    Department:depts.find(d=>d.id===e.dept_id)?.name||'',
    Shift:shifts.find(s=>s.id===e.shift_id)?.name||'',
    Role:e.role,SalaryPerDay:e.salary_per_day,Status:e.status,JoinDate:e.join_date
  }));
};

async function applyEmpFilters() {
  const search = val('empSearch');
  const dept   = val('empDeptFilter');
  const shift  = val('empShiftFilter');
  const status = val('empStatusFilter');
  const emps = await DB.getEmployees({search,dept_id:dept||undefined,shift_id:shift||undefined,status:status||undefined});
  el('empTbody').innerHTML = buildEmpRows(emps, APP_STATE.departments, APP_STATE.shifts);
}

function buildEmpRows(emps, depts, shifts) {
  if (!emps.length) return `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">No employees found</div><div class="empty-sub">Try adjusting filters or add a new employee</div></div></td></tr>`;
  return emps.map(e=>{
    const dept  = depts.find(d=>d.id===e.dept_id);
    const shift = shifts.find(s=>s.id===e.shift_id);
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          ${empAvatar(e)}
          <div>
            <div style="font-weight:600;color:var(--text)">${e.first} ${e.last}</div>
            <div style="font-size:0.75rem;color:var(--text3)">${e.id} · ${e.email}</div>
          </div>
        </div>
      </td>
      <td>${dept?`<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:7px;height:7px;border-radius:50%;background:${dept.color};flex-shrink:0"></span>${dept.name}</span>`:'—'}</td>
      <td>${shift?shiftBadge(shift):'—'}</td>
      <td>${e.role||'—'}</td>
      <td>${fmtMoney(e.salary_per_day)}</td>
      <td>${fmtDate(e.join_date)}</td>
      <td>${statusBadge(e.status)}</td>
      <td><div class="td-actions">
        <button class="btn btn-secondary btn-xs" onclick="openViewEmployee('${e.id}')">View</button>
        <button class="btn btn-secondary btn-xs" onclick="openEditEmployee('${e.id}')">Edit</button>
        <button class="btn btn-danger btn-xs" onclick="deleteEmp('${e.id}')">Del</button>
      </div></td>
    </tr>`;
  }).join('');
}

function empFormHtml(emp={}, depts=[], shifts=[]) {
  const deptOpts = depts.map(d=>`<option value="${d.id}" ${emp.dept_id===d.id?'selected':''}>${d.name}</option>`).join('');
  const shiftOpts = shifts.map(s=>`<option value="${s.id}" ${emp.shift_id===s.id?'selected':''}>${s.name}</option>`).join('');
  return `
    <div class="form-row">
      <div class="form-group"><label>First Name *</label><input class="form-input" id="ef-first" value="${emp.first||''}" placeholder="First name"></div>
      <div class="form-group"><label>Last Name *</label><input class="form-input" id="ef-last" value="${emp.last||''}" placeholder="Last name"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Employee ID *</label><input class="form-input" id="ef-id" value="${emp.id||''}" placeholder="EMP001" ${emp.id?'readonly':''}></div>
      <div class="form-group"><label>Role / Designation *</label><input class="form-input" id="ef-role" value="${emp.role||''}" placeholder="e.g. Software Engineer"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Email *</label><input type="email" class="form-input" id="ef-email" value="${emp.email||''}" placeholder="email@company.com"></div>
      <div class="form-group"><label>Phone</label><input class="form-input" id="ef-phone" value="${emp.phone||''}" placeholder="9876543210"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Department</label><select class="form-select" id="ef-dept"><option value="">Select dept</option>${deptOpts}</select></div>
      <div class="form-group"><label>Shift</label><select class="form-select" id="ef-shift"><option value="">Select shift</option>${shiftOpts}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Salary Per Day (${NEXERM_CONFIG.CURRENCY_SYMBOL})</label><input type="number" class="form-input" id="ef-salary" value="${emp.salary_per_day||''}" placeholder="2000"></div>
      <div class="form-group"><label>Join Date</label><input type="date" class="form-input" id="ef-join" value="${emp.join_date||todayStr()}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Gender</label><select class="form-select" id="ef-gender"><option value="">Select</option><option ${emp.gender==='Male'?'selected':''}>Male</option><option ${emp.gender==='Female'?'selected':''}>Female</option><option ${emp.gender==='Other'?'selected':''}>Other</option></select></div>
      <div class="form-group"><label>Blood Group</label><input class="form-input" id="ef-blood" value="${emp.blood||''}" placeholder="O+, A+, B-..."></div>
    </div>
    <div class="form-group"><label>Status</label><select class="form-select" id="ef-status"><option ${emp.status==='Active'||!emp.status?'selected':''}>Active</option><option ${emp.status==='Inactive'?'selected':''}>Inactive</option></select></div>`;
}

window.openAddEmployee = function() {
  openModal('Add New Employee', empFormHtml({}, APP_STATE.departments, APP_STATE.shifts), [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Add Employee',cls:'btn-primary',action:saveNewEmployee},
  ], {size:'lg'});
};

async function saveNewEmployee() {
  const first=val('ef-first'),last=val('ef-last'),id=val('ef-id'),role=val('ef-role'),email=val('ef-email');
  if(!first||!last||!id||!role||!email) return showToast('Fill all required fields','error');
  const existing = await DB.getEmployee(id);
  if(existing) return showToast('Employee ID already exists','error');
  const emp={id,first,last,role,email,phone:val('ef-phone'),dept_id:val('ef-dept'),shift_id:val('ef-shift'),
    salary_per_day:parseFloat(val('ef-salary'))||0,join_date:val('ef-join'),gender:val('ef-gender'),
    blood:val('ef-blood'),status:val('ef-status')||'Active'};
  await DB.addEmployee(emp);
  closeModal(); showToast('Employee added','success');
  await loadGlobalData(); renderEmployees();
};

window.openEditEmployee = async function(id) {
  const emp = await DB.getEmployee(id);
  openModal('Edit Employee — '+emp.first+' '+emp.last, empFormHtml(emp, APP_STATE.departments, APP_STATE.shifts), [
    {label:'Cancel',cls:'btn-secondary',action:closeModal},
    {label:'Save Changes',cls:'btn-primary',action:async()=>{
      const updates={first:val('ef-first'),last:val('ef-last'),role:val('ef-role'),email:val('ef-email'),
        phone:val('ef-phone'),dept_id:val('ef-dept'),shift_id:val('ef-shift'),
        salary_per_day:parseFloat(val('ef-salary'))||0,join_date:val('ef-join'),
        gender:val('ef-gender'),blood:val('ef-blood'),status:val('ef-status')};
      await DB.updateEmployee(id,updates);
      closeModal(); showToast('Employee updated','success');
      await loadGlobalData(); renderEmployees();
    }},
  ], {size:'lg'});
};

window.openViewEmployee = async function(id) {
  const emp = await DB.getEmployee(id);
  const dept  = APP_STATE.departments.find(d=>d.id===emp.dept_id);
  const shift = APP_STATE.shifts.find(s=>s.id===emp.shift_id);
  const att   = (await DB.getAttendanceRange('2026-01-01', todayStr())).filter(a=>a.emp_id===id);
  const presentDays = att.filter(a=>a.status==='Present').length;
  openModal('Employee Profile', `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border)">
      ${empAvatar(emp,56)}
      <div>
        <div style="font-family:var(--font-head);font-size:1.2rem;font-weight:800">${emp.first} ${emp.last}</div>
        <div style="color:var(--text3);font-size:0.85rem">${emp.role||'—'} · ${emp.id}</div>
        <div style="margin-top:6px">${statusBadge(emp.status)}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:0.875rem">
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">EMAIL</div>${emp.email||'—'}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">PHONE</div>${emp.phone||'—'}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">DEPARTMENT</div>${dept?`<span style="color:${dept.color}">${dept.name}</span>`:'—'}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">SHIFT</div>${shift?shiftBadge(shift):'—'}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">SALARY/DAY</div>${fmtMoney(emp.salary_per_day)}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">JOIN DATE</div>${fmtDate(emp.join_date)}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">GENDER</div>${emp.gender||'—'}</div>
      <div><div style="color:var(--text3);font-size:0.72rem;font-weight:700;letter-spacing:0.5px;margin-bottom:3px">BLOOD GROUP</div>${emp.blood||'—'}</div>
    </div>
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
      <div style="background:var(--green-dim);border:1px solid rgba(16,185,129,0.2);border-radius:var(--r);padding:12px">
        <div style="font-family:var(--font-head);font-size:1.4rem;font-weight:900;color:var(--green)">${presentDays}</div>
        <div style="font-size:0.72rem;color:var(--text3)">Days Present</div>
      </div>
      <div style="background:var(--blue-dim);border:1px solid rgba(37,99,235,0.2);border-radius:var(--r);padding:12px">
        <div style="font-family:var(--font-head);font-size:1.4rem;font-weight:900;color:var(--blue-lt)">${fmtMoney(emp.salary_per_day*presentDays)}</div>
        <div style="font-size:0.72rem;color:var(--text3)">Earned (YTD)</div>
      </div>
      <div style="background:var(--amber-dim);border:1px solid rgba(245,158,11,0.2);border-radius:var(--r);padding:12px">
        <div style="font-family:var(--font-head);font-size:1.4rem;font-weight:900;color:var(--amber)">${att.filter(a=>a.status==='Absent').length}</div>
        <div style="font-size:0.72rem;color:var(--text3)">Absent Days</div>
      </div>
    </div>`, [
    {label:'Close',cls:'btn-secondary',action:closeModal},
    {label:'Edit',cls:'btn-primary',action:()=>{closeModal();openEditEmployee(id);}},
  ], {size:'lg'});
};

window.deleteEmp = function(id) {
  const emp = APP_STATE.employees.find(e=>e.id===id);
  confirmDialog(`Delete <strong>${emp?.first} ${emp?.last}</strong>? This cannot be undone.`, async()=>{
    await DB.deleteEmployee(id); showToast('Employee deleted','info');
    await loadGlobalData(); renderEmployees();
  });
};
