// NexERM — Payroll Page
window.renderPayroll = async function() {
  const now = new Date();
  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Payroll</div><div class="page-sub">Calculate and manage employee salaries</div></div>
      <div class="page-header-actions">
        <select class="filter-input" id="prMonth">
          ${['January','February','March','April','May','June','July','August','September','October','November','December']
            .map((m,i)=>`<option value="${i}" ${i===now.getMonth()?'selected':''}>${m}</option>`).join('')}
        </select>
        <select class="filter-input" id="prYear">
          ${[2024,2025,2026].map(y=>`<option ${y===now.getFullYear()?'selected':''}>${y}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="calcPayroll()">⟳ Calculate</button>
        <button class="btn btn-secondary" onclick="exportPayrollCSV()">⬇ Export</button>
      </div>
    </div>
    <div class="payroll-strip" id="payrollStrip"></div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Employee</th><th>Shift</th><th>Days Present</th><th>Days Absent</th><th>OT Hours</th><th>Gross Pay</th><th>PF (12%)</th><th>Tax (5%)</th><th>Net Pay</th><th>Payslip</th></tr></thead>
        <tbody id="prTbody"><tr><td colspan="10"><div class="empty-state"><div class="empty-icon">💰</div><div class="empty-title">Click Calculate to generate payroll</div></div></td></tr></tbody>
      </table>
    </div>`;

  await calcPayroll();
};

window.calcPayroll = async function() {
  const month = parseInt(val('prMonth'));
  const year  = parseInt(val('prYear'));
  const emps  = await DB.getEmployees({status:'Active'});
  const shifts = APP_STATE.shifts;
  const wDays  = workDaysInMonth(year, month);
  const dim    = daysInMonth(year, month);

  // Fetch attendance for month
  const from = `${year}-${String(month+1).padStart(2,'0')}-01`;
  const to   = `${year}-${String(month+1).padStart(2,'0')}-${String(dim).padStart(2,'0')}`;
  const allAtt = await DB.getAttendanceRange(from, to);

  let totalGross=0, totalNet=0, totalDeduct=0, totalOT=0;

  const rows = emps.map(emp => {
    const empAtt = allAtt.filter(a=>a.emp_id===emp.id);
    const present  = empAtt.filter(a=>a.status==='Present'||a.status==='Late').length || Math.max(1, wDays-2);
    const absent   = Math.max(0, wDays - present - empAtt.filter(a=>a.status==='On Leave').length);
    const otHrs    = empAtt.reduce((s,a)=>s+(a.overtime_hrs||0),0);
    const dayRate  = emp.salary_per_day||0;
    const basePay  = dayRate * present;
    const otPay    = otHrs * (dayRate/8) * 1.5;
    const gross    = basePay + otPay;
    const pf       = Math.round(basePay * 0.12);
    const tax      = Math.round(gross * 0.05);
    const netPay   = Math.round(gross - pf - tax);
    const shift    = shifts.find(s=>s.id===emp.shift_id);
    totalGross+=gross; totalNet+=netPay; totalDeduct+=pf+tax; totalOT+=otPay;
    return {emp, shift, present, absent, otHrs, basePay, otPay, gross, pf, tax, netPay};
  });

  // Summary strip
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  el('payrollStrip').innerHTML = `
    <div class="payroll-strip-card"><div class="payroll-strip-label">Gross Payroll</div><div class="payroll-strip-value">${fmtMoney(totalGross)}</div></div>
    <div class="payroll-strip-card"><div class="payroll-strip-label">Total Deductions</div><div class="payroll-strip-value" style="color:var(--red)">${fmtMoney(totalDeduct)}</div></div>
    <div class="payroll-strip-card"><div class="payroll-strip-label">Overtime Pay</div><div class="payroll-strip-value" style="color:var(--amber)">${fmtMoney(totalOT)}</div></div>
    <div class="payroll-strip-card"><div class="payroll-strip-label">Net Payroll</div><div class="payroll-strip-value" style="color:var(--green)">${fmtMoney(totalNet)}</div></div>`;

  el('prTbody').innerHTML = rows.length ? rows.map(r=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px">${empAvatar(r.emp,28)}<div><div style="font-weight:600;color:var(--text)">${r.emp.first} ${r.emp.last}</div><div style="font-size:0.75rem;color:var(--text3)">${r.emp.id}</div></div></div></td>
      <td>${r.shift?shiftBadge(r.shift):'—'}</td>
      <td style="color:var(--green);font-weight:600">${r.present}</td>
      <td style="color:var(--red);font-weight:600">${r.absent}</td>
      <td style="color:var(--amber)">${r.otHrs.toFixed(1)}h</td>
      <td>${fmtMoney(r.gross)}</td>
      <td style="color:var(--red)">${fmtMoney(r.pf)}</td>
      <td style="color:var(--red)">${fmtMoney(r.tax)}</td>
      <td style="color:var(--green);font-weight:800;font-family:var(--font-head);font-size:1rem">${fmtMoney(r.netPay)}</td>
      <td><button class="btn btn-secondary btn-xs" onclick="viewPayslip('${r.emp.id}',${month},${year})">Payslip</button></td>
    </tr>`).join('')
  : `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No active employees</div></div></td></tr>`;

  // Store rows for export
  window._payrollRows = rows;
  window._payrollMeta = { month, year, months };
};

window.exportPayrollCSV = function() {
  if(!window._payrollRows?.length) return showToast('Calculate payroll first','warn');
  const {month,year,months} = window._payrollMeta;
  exportCSV(window._payrollRows.map(r=>({
    ID:r.emp.id, Name:`${r.emp.first} ${r.emp.last}`, Shift:r.shift?.name||'',
    DaysPresent:r.present, DaysAbsent:r.absent, OTHours:r.otHrs.toFixed(1),
    GrossPay:Math.round(r.gross), PF:r.pf, Tax:r.tax, NetPay:r.netPay
  })),`payroll_${months[month]}_${year}.csv`);
};

window.viewPayslip = async function(empId, month, year) {
  const emp = await DB.getEmployee(empId);
  if(!emp) return;
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const row = window._payrollRows?.find(r=>r.emp.id===empId);
  if(!row) return showToast('Calculate payroll first','warn');
  const settings = await DB.getSettings();
  const dept = APP_STATE.departments.find(d=>d.id===emp.dept_id);

  openModal(`Payslip — ${months[month]} ${year}`, `
    <div class="payslip">
      <div class="payslip-header">
        <div style="font-family:var(--font-head);font-size:1.1rem;font-weight:900;color:var(--text)">${settings.company_name||'Company'}</div>
        <div style="font-size:0.8rem;color:var(--text2);margin-top:2px">Salary Slip for ${months[month]} ${year}</div>
      </div>
      <div class="payslip-grid">
        <div class="payslip-row"><div class="payslip-key">Employee</div><div class="payslip-val">${emp.first} ${emp.last}</div></div>
        <div class="payslip-row"><div class="payslip-key">Employee ID</div><div class="payslip-val">${emp.id}</div></div>
        <div class="payslip-row"><div class="payslip-key">Designation</div><div class="payslip-val">${emp.role||'—'}</div></div>
        <div class="payslip-row"><div class="payslip-key">Department</div><div class="payslip-val">${dept?.name||'—'}</div></div>
        <div class="payslip-row"><div class="payslip-key">Days Present</div><div class="payslip-val" style="color:var(--green)">${row.present}</div></div>
        <div class="payslip-row"><div class="payslip-key">Overtime Hours</div><div class="payslip-val" style="color:var(--amber)">${row.otHrs.toFixed(1)}h</div></div>
      </div>
      <div class="payslip-table">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text3);padding:8px 0 4px">Earnings</div>
        <div class="payslip-line"><span>Basic Pay (${row.present} days × ${fmtMoney(emp.salary_per_day)})</span><span style="color:var(--green)">${fmtMoney(row.basePay)}</span></div>
        <div class="payslip-line"><span>Overtime Pay (${row.otHrs.toFixed(1)}h × 1.5x)</span><span style="color:var(--amber)">${fmtMoney(row.otPay)}</span></div>
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text3);padding:10px 0 4px">Deductions</div>
        <div class="payslip-line"><span>Provident Fund (12%)</span><span style="color:var(--red)">- ${fmtMoney(row.pf)}</span></div>
        <div class="payslip-line"><span>Income Tax (5%)</span><span style="color:var(--red)">- ${fmtMoney(row.tax)}</span></div>
      </div>
      <div class="payslip-total">
        <span style="font-family:var(--font-head);font-size:1rem">NET PAY</span>
        <span style="font-family:var(--font-head);font-size:1.3rem;color:var(--green)">${fmtMoney(row.netPay)}</span>
      </div>
    </div>`,
  [
    {label:'Close',cls:'btn-secondary',action:closeModal},
    {label:'⬇ Download CSV',cls:'btn-primary',action:()=>{
      exportCSV([{ID:emp.id,Name:`${emp.first} ${emp.last}`,Month:months[month],Year:year,DaysPresent:row.present,OTHours:row.otHrs.toFixed(1),GrossPay:Math.round(row.gross),PF:row.pf,Tax:row.tax,NetPay:row.netPay}],`payslip_${emp.id}_${months[month]}_${year}.csv`);
    }},
  ], {size:'lg'});
};
