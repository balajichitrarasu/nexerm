// NexERM — Attendance Page
window.renderAttendance = async function() {
  const [emps,shifts] = await Promise.all([DB.getEmployees({status:'Active'}),DB.getShifts()]);
  const today = todayStr();
  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Attendance</div><div class="page-sub">Track daily check-in / check-out</div></div>
      <div class="page-header-actions">
        <button class="btn btn-secondary" onclick="markAllPresent()">✓ Mark All Present</button>
        <button class="btn btn-secondary" onclick="exportAttendance()">⬇ Export</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-group">
        <input type="date" class="filter-input" id="attDate" value="${today}">
        <select class="filter-input" id="attShift"><option value="">All Shifts</option>${shifts.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select>
        <select class="filter-input" id="attStatus"><option value="">All Status</option><option>Present</option><option>Absent</option><option>On Leave</option><option>Late</option><option>Half Day</option></select>
      </div>
      <div class="filter-actions"><button class="btn btn-primary btn-sm" onclick="loadAttTable()">Apply</button></div>
    </div>
    <div id="attTableWrap" class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Employee</th><th>Shift</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Overtime</th><th>Status</th><th>Note</th><th>Save</th></tr></thead>
        <tbody id="attTbody"></tbody>
      </table>
    </div>`;

  el('attDate').addEventListener('change', loadAttTable);
  el('attShift').addEventListener('change', loadAttTable);
  el('attStatus').addEventListener('change', loadAttTable);
  await loadAttTable();

  window.markAllPresent = async function() {
    const date=val('attDate')||today;
    const settings=await DB.getSettings();
    for(const emp of emps) {
      const shift=shifts.find(s=>s.id===emp.shift_id);
      await DB.upsertAttendance({date,emp_id:emp.id,check_in:shift?shift.start:null,check_out:null,status:'Present',overtime_hrs:0,note:''});
    }
    showToast('All marked Present','success'); await loadAttTable();
  };

  window.exportAttendance = async function() {
    const date=val('attDate')||today;
    const recs=await DB.getAttendance(date);
    const rows=recs.map(r=>{
      const emp=emps.find(e=>e.id===r.emp_id)||{};
      const shift=shifts.find(s=>s.id===emp.shift_id)||{};
      const hrs=calcHours(r.check_in,r.check_out);
      return {Date:r.date,ID:r.emp_id,Name:`${emp.first||''} ${emp.last||''}`,Shift:shift.name||'',CheckIn:r.check_in||'',CheckOut:r.check_out||'',Hours:hrs.toFixed(2),Status:r.status,Note:r.note||''};
    });
    exportCSV(rows,`attendance_${date}.csv`);
  };
};

async function loadAttTable() {
  const date=val('attDate')||todayStr();
  const shiftF=val('attShift');
  const statusF=val('attStatus');
  const emps=(await DB.getEmployees({status:'Active'})).filter(e=>!shiftF||e.shift_id===shiftF);
  const recs=await DB.getAttendance(date);
  const shifts=APP_STATE.shifts;

  el('attTbody').innerHTML=emps.map(emp=>{
    const shift=shifts.find(s=>s.id===emp.shift_id);
    let rec=recs.find(r=>r.emp_id===emp.id)||{date,emp_id:emp.id,check_in:'',check_out:'',status:'Absent',overtime_hrs:0,note:''};
    if(statusF&&rec.status!==statusF) return '';
    const hrs=calcHours(rec.check_in,rec.check_out);
    const ot=Math.max(0,hrs-8);
    const statusColors={Present:'var(--green)',Absent:'var(--red)','On Leave':'var(--amber)',Late:'var(--purple)','Half Day':'var(--cyan)'};
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px">${empAvatar(emp,28)}<div><div style="font-weight:600;color:var(--text)">${emp.first} ${emp.last}</div><div style="font-size:0.75rem;color:var(--text3)">${emp.id}</div></div></div></td>
      <td>${shift?shiftBadge(shift):'—'}</td>
      <td><input type="time" class="filter-input" style="width:110px" id="ci-${emp.id}" value="${rec.check_in||''}"></td>
      <td><input type="time" class="filter-input" style="width:110px" id="co-${emp.id}" value="${rec.check_out||''}"></td>
      <td style="font-weight:600;color:${hrs>0?'var(--text)':'var(--text3)'}">${hrs>0?hrs.toFixed(1)+'h':'—'}</td>
      <td style="color:var(--amber)">${ot>0?'+'+ot.toFixed(1)+'h':'—'}</td>
      <td>
        <select class="filter-input" id="st-${emp.id}" style="width:110px">
          ${['Present','Absent','On Leave','Late','Half Day'].map(s=>`<option ${s===rec.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" class="filter-input" id="nt-${emp.id}" value="${rec.note||''}" placeholder="optional" style="width:100px"></td>
      <td><button class="btn btn-primary btn-xs" onclick="saveAttRow('${emp.id}','${date}')">Save</button></td>
    </tr>`;
  }).join('');
}

window.saveAttRow = async function(empId, date) {
  const ci=val('ci-'+empId), co=val('co-'+empId), st=val('st-'+empId), nt=val('nt-'+empId);
  const hrs=calcHours(ci,co);
  const ot=Math.max(0,hrs-8);
  await DB.upsertAttendance({date,emp_id:empId,check_in:ci||null,check_out:co||null,status:st,overtime_hrs:parseFloat(ot.toFixed(2)),note:nt});
  showToast('Saved','success');
};
