// NexERM — Reports Page
window.renderReports = async function() {
  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Reports</div><div class="page-sub">Generate and export analytical reports</div></div>
    </div>
    <div class="reports-grid">
      <div class="report-card">
        <div class="report-icon">📊</div>
        <div class="report-name">Attendance Report</div>
        <div class="report-desc">Daily and monthly attendance summary with shift-wise breakdown and percentage analysis.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input type="date" class="filter-input" id="rpt-att-from" value="${firstOfMonth()}">
          <input type="date" class="filter-input" id="rpt-att-to" value="${todayStr()}">
          <button class="btn btn-primary btn-sm" onclick="genAttReport()">Generate</button>
        </div>
      </div>
      <div class="report-card">
        <div class="report-icon">💰</div>
        <div class="report-name">Payroll Summary</div>
        <div class="report-desc">Full salary breakdown — base pay, overtime, PF, tax and net pay for all employees.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select class="filter-input" id="rpt-pr-month">
            ${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i)=>`<option value="${i}" ${i===new Date().getMonth()?'selected':''}>${m}</option>`).join('')}
          </select>
          <select class="filter-input" id="rpt-pr-year">${[2024,2025,2026].map(y=>`<option ${y===new Date().getFullYear()?'selected':''}>${y}</option>`).join('')}</select>
          <button class="btn btn-primary btn-sm" onclick="genPayrollReport()">Generate</button>
        </div>
      </div>
      <div class="report-card">
        <div class="report-icon">🔄</div>
        <div class="report-name">Shift Coverage</div>
        <div class="report-desc">Headcount per shift, coverage percentage, and employee distribution across shifts.</div>
        <button class="btn btn-primary btn-sm" onclick="genShiftReport()">Generate</button>
      </div>
      <div class="report-card">
        <div class="report-icon">🏖️</div>
        <div class="report-name">Leave Analysis</div>
        <div class="report-desc">Leave utilization by type, employee, and department. Pending vs approved breakdown.</div>
        <button class="btn btn-primary btn-sm" onclick="genLeaveReport()">Generate</button>
      </div>
    </div>
    <div id="rpt-output" style="display:none"></div>`;
};

function firstOfMonth() {
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
}

function rptHeader(title, sub='') {
  return `<div class="card" style="margin-top:0">
    <div class="card-header">
      <div>
        <div class="card-title" style="font-size:1.1rem">${title}</div>
        ${sub?`<div style="font-size:0.8rem;color:var(--text3);margin-top:2px">${sub}</div>`:''}
      </div>
      <button class="btn btn-secondary btn-sm" onclick="el('rpt-output').style.display='none'">✕ Close</button>
    </div>`;
}

window.genAttReport = async function() {
  const from=val('rpt-att-from'), to=val('rpt-att-to');
  const emps=await DB.getEmployees({status:'Active'});
  const recs=await DB.getAttendanceRange(from,to);
  const totalSlots=emps.length*(new Date(to)-new Date(from))/86400000+emps.length;
  const present=recs.filter(r=>r.status==='Present').length;
  const absent=recs.filter(r=>r.status==='Absent').length;
  const onLeave=recs.filter(r=>r.status==='On Leave').length;
  const late=recs.filter(r=>r.status==='Late').length;
  const pct=totalSlots?Math.round((present/totalSlots)*100):0;

  const empRows=emps.map(emp=>{
    const empRecs=recs.filter(r=>r.emp_id===emp.id);
    const p=empRecs.filter(r=>r.status==='Present').length;
    const a=empRecs.filter(r=>r.status==='Absent').length;
    const l=empRecs.filter(r=>r.status==='On Leave').length;
    const tt=p+a+l||1;
    return {emp,p,a,l,pct:Math.round((p/tt)*100)};
  }).sort((a,b)=>b.pct-a.pct);

  const out=el('rpt-output');
  out.style.display='block';
  out.innerHTML=rptHeader('Attendance Report',`${fmtDate(from)} to ${fmtDate(to)}`)+`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--green)"></div><div class="stat-label">Present</div><div class="stat-value">${present}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--red)"></div><div class="stat-label">Absent</div><div class="stat-value">${absent}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--amber)"></div><div class="stat-label">On Leave</div><div class="stat-value">${onLeave}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--blue)"></div><div class="stat-label">Attendance %</div><div class="stat-value">${pct}%</div></div>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Employee</th><th>Present</th><th>Absent</th><th>On Leave</th><th>Attendance %</th><th>Bar</th></tr></thead>
      <tbody>${empRows.map(r=>`<tr>
        <td><div style="display:flex;align-items:center;gap:8px">${empAvatar(r.emp,26)}<strong>${r.emp.first} ${r.emp.last}</strong></div></td>
        <td style="color:var(--green);font-weight:600">${r.p}</td>
        <td style="color:var(--red);font-weight:600">${r.a}</td>
        <td style="color:var(--amber);font-weight:600">${r.l}</td>
        <td style="font-weight:700">${r.pct}%</td>
        <td style="width:150px"><div class="progress-bar"><div class="progress-fill" style="width:${r.pct}%;background:${r.pct>=80?'var(--green)':r.pct>=60?'var(--amber)':'var(--red)'}"></div></div></td>
      </tr>`).join('')}</tbody>
    </table></div>
    <div style="margin-top:14px;text-align:right"><button class="btn btn-secondary btn-sm" onclick="exportAttReportCSV()">⬇ Export CSV</button></div>
  </div>`;
  window._attReportRows=empRows; window._attReportMeta={from,to};
  out.scrollIntoView({behavior:'smooth'});
};

window.exportAttReportCSV=function(){
  if(!window._attReportRows) return;
  exportCSV(window._attReportRows.map(r=>({ID:r.emp.id,Name:`${r.emp.first} ${r.emp.last}`,Present:r.p,Absent:r.a,OnLeave:r.l,AttendancePct:r.pct+'%'})),`attendance_report.csv`);
};

window.genPayrollReport = async function() {
  const month=parseInt(val('rpt-pr-month')), year=parseInt(val('rpt-pr-year'));
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const emps=await DB.getEmployees({status:'Active'});
  const wDays=workDaysInMonth(year,month);
  const dim=daysInMonth(year,month);
  const from=`${year}-${String(month+1).padStart(2,'0')}-01`;
  const to=`${year}-${String(month+1).padStart(2,'0')}-${String(dim).padStart(2,'0')}`;
  const allAtt=await DB.getAttendanceRange(from,to);

  let totalGross=0,totalNet=0;
  const rows=emps.map(emp=>{
    const ea=allAtt.filter(a=>a.emp_id===emp.id);
    const present=ea.filter(a=>a.status==='Present'||a.status==='Late').length||Math.max(1,wDays-2);
    const otHrs=ea.reduce((s,a)=>s+(a.overtime_hrs||0),0);
    const gross=emp.salary_per_day*present + otHrs*(emp.salary_per_day/8)*1.5;
    const pf=Math.round(emp.salary_per_day*present*0.12);
    const tax=Math.round(gross*0.05);
    const net=Math.round(gross-pf-tax);
    totalGross+=gross; totalNet+=net;
    return {emp,present,otHrs,gross,pf,tax,net};
  });

  const out=el('rpt-output');
  out.style.display='block';
  out.innerHTML=rptHeader('Payroll Report',months[month]+' '+year)+`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--blue)"></div><div class="stat-label">Employees</div><div class="stat-value">${emps.length}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--amber)"></div><div class="stat-label">Gross Payroll</div><div class="stat-value" style="font-size:1.3rem">${fmtMoney(totalGross)}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--green)"></div><div class="stat-label">Net Payroll</div><div class="stat-value" style="font-size:1.3rem">${fmtMoney(totalNet)}</div></div>
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Employee</th><th>Days</th><th>OT Hrs</th><th>Gross</th><th>PF</th><th>Tax</th><th>Net Pay</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>
        <td><strong>${r.emp.first} ${r.emp.last}</strong><br><small>${r.emp.id}</small></td>
        <td>${r.present}</td><td style="color:var(--amber)">${r.otHrs.toFixed(1)}h</td>
        <td>${fmtMoney(r.gross)}</td><td style="color:var(--red)">${fmtMoney(r.pf)}</td><td style="color:var(--red)">${fmtMoney(r.tax)}</td>
        <td style="color:var(--green);font-weight:700">${fmtMoney(r.net)}</td>
      </tr>`).join('')}</tbody>
    </table></div>
    <div style="margin-top:14px;text-align:right"><button class="btn btn-secondary btn-sm" onclick="exportCSV(window._prReportRows,'payroll_report.csv')">⬇ Export</button></div>
  </div>`;
  window._prReportRows=rows.map(r=>({ID:r.emp.id,Name:`${r.emp.first} ${r.emp.last}`,Days:r.present,OTHrs:r.otHrs.toFixed(1),Gross:Math.round(r.gross),PF:r.pf,Tax:r.tax,NetPay:r.net}));
  out.scrollIntoView({behavior:'smooth'});
};

window.genShiftReport = async function() {
  const shifts=await DB.getShifts();
  const emps=await DB.getEmployees({status:'Active'});
  const out=el('rpt-output');
  out.style.display='block';
  out.innerHTML=rptHeader('Shift Coverage Report')+`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-bottom:20px">
      ${shifts.map(s=>{
        const count=emps.filter(e=>e.shift_id===s.id).length;
        const pct=emps.length?Math.round((count/emps.length)*100):0;
        return `<div class="stat-card"><div class="stat-card-accent" style="background:${s.color}"></div>
          <div class="stat-label">${s.name} Shift</div>
          <div class="stat-value">${count}</div>
          <div class="stat-delta">${s.start}–${s.end} · ${pct}% of staff</div>
          <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:${pct}%;background:${s.color}"></div></div>
        </div>`;
      }).join('')}
    </div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Shift</th><th>Time</th><th>Employees</th><th>Coverage</th></tr></thead>
      <tbody>${shifts.map(s=>{
        const count=emps.filter(e=>e.shift_id===s.id).length;
        return `<tr><td><span class="badge" style="background:${s.color}22;color:${s.color};border:1px solid ${s.color}44">${s.name}</span></td>
          <td>${s.start} – ${s.end}</td><td style="font-weight:700">${count}</td>
          <td><div class="progress-bar"><div class="progress-fill" style="width:${emps.length?Math.round(count/emps.length*100):0}%;background:${s.color}"></div></div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>`;
  out.scrollIntoView({behavior:'smooth'});
};

window.genLeaveReport = async function() {
  const leaves=await DB.getLeaves();
  const emps=APP_STATE.employees;
  const byType={};
  leaves.forEach(l=>{byType[l.type]=(byType[l.type]||0)+l.days;});
  const pending=leaves.filter(l=>l.status==='Pending').length;
  const approved=leaves.filter(l=>l.status==='Approved').length;
  const rejected=leaves.filter(l=>l.status==='Rejected').length;

  const out=el('rpt-output');
  out.style.display='block';
  out.innerHTML=rptHeader('Leave Analysis Report')+`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--blue)"></div><div class="stat-label">Total Requests</div><div class="stat-value">${leaves.length}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--amber)"></div><div class="stat-label">Pending</div><div class="stat-value">${pending}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--green)"></div><div class="stat-label">Approved</div><div class="stat-value">${approved}</div></div>
      <div class="stat-card"><div class="stat-card-accent" style="background:var(--red)"></div><div class="stat-label">Rejected</div><div class="stat-value">${rejected}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">Days by Leave Type</div>
        ${Object.entries(byType).map(([type,days])=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:0.85rem">${type}</span>
            <span class="badge badge-blue">${days} days</span>
          </div>`).join('')||'<div class="empty-state" style="padding:20px">No data</div>'}
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:14px">Top Leave Takers</div>
        ${[...emps].map(e=>({e,total:leaves.filter(l=>l.emp_id===e.id&&l.status==='Approved').reduce((s,l)=>s+l.days,0)}))
          .sort((a,b)=>b.total-a.total).slice(0,6).map(({e,total})=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:8px">${empAvatar(e,24)}<span style="font-size:0.85rem;font-weight:600">${e.first} ${e.last}</span></div>
            <span class="badge badge-amber">${total} days</span>
          </div>`).join('')||'<div class="empty-state" style="padding:20px">No approved leaves</div>'}
      </div>
    </div>
  </div>`;
  out.scrollIntoView({behavior:'smooth'});
};
