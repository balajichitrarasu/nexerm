// NexERM — Dashboard Page

window.renderDashboard = async function() {
  await loadGlobalData();
  const today = todayStr();
  const activeEmps = APP_STATE.employees.filter(e=>e.status==='Active');
  const attRecords = await DB.getAttendance(today);
  const pendLeaves = await DB.getLeaves({status:'Pending'});
  const activity   = await DB.getActivity(6);

  const present  = attRecords.filter(a=>a.status==='Present').length;
  const absent   = attRecords.filter(a=>a.status==='Absent').length;
  const onLeave  = attRecords.filter(a=>a.status==='On Leave').length;
  const attPct   = activeEmps.length ? Math.round((present/activeEmps.length)*100) : 0;
  const monthPay = activeEmps.reduce((s,e)=>s+(e.salary_per_day*26),0);

  // Build week bars
  const weekDays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weekData=[88,92,78,95,85,55,20];
  const maxW=Math.max(...weekData);
  const bars=weekData.map((v,i)=>`
    <div class="bar-col">
      <div class="bar-val">${v}%</div>
      <div class="bar" style="height:${Math.max(4,(v/maxW)*70)}px;background:${i===new Date().getDay()-1||i===4?'var(--blue)':'var(--blue-dim)'}"></div>
      <div class="bar-label">${weekDays[i]}</div>
    </div>`).join('');

  // Shift overview
  const shiftRows = APP_STATE.shifts.map(s=>{
    const count = activeEmps.filter(e=>e.shift_id===s.id).length;
    return `<div class="shift-emp-row" style="justify-content:space-between">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:8px;height:8px;border-radius:50%;background:${s.color}"></div>
        <span style="font-weight:600;color:var(--text)">${s.name}</span>
        <span style="font-size:0.75rem;color:var(--text3)">${s.start}–${s.end}</span>
      </div>
      <span class="badge" style="background:${s.color}22;color:${s.color};border:1px solid ${s.color}44">${count} staff</span>
    </div>`;
  }).join('');

  // Activity feed
  const actFeed = activity.map(a=>`
    <div class="activity-item">
      <div class="activity-dot-wrap"><div class="activity-dot" style="background:${a.color}"></div></div>
      <div class="activity-body">
        <div class="activity-text"><strong>${a.text}</strong> — ${a.detail}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>`).join('');

  // Pending leave list
  const pendRows = pendLeaves.slice(0,4).map(l=>{
    const emp=APP_STATE.employees.find(e=>e.id===l.emp_id);
    return `<div class="activity-item" style="align-items:center">
      ${empAvatar(emp||{first:'?',last:'?',id:l.emp_id},28)}
      <div style="flex:1;min-width:0">
        <div style="font-size:0.83rem;font-weight:600;color:var(--text)">${fullName(emp||{first:'?',last:''})}</div>
        <div style="font-size:0.75rem;color:var(--text3)">${l.type} · ${l.days} day(s)</div>
      </div>
      <div style="display:flex;gap:5px">
        <button class="btn btn-success btn-xs" onclick="quickApprove('${l.id}')">✓</button>
        <button class="btn btn-danger btn-xs" onclick="quickReject('${l.id}')">✗</button>
      </div>
    </div>`;
  }).join('') || '<div class="empty-state" style="padding:20px"><div class="empty-icon">🎉</div><div class="empty-sub">No pending leaves</div></div>';

  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <div class="page-title-lg">Dashboard</div>
        <div class="page-sub">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-accent" style="background:var(--blue)"></div>
        <div class="stat-label">Total Employees</div>
        <div class="stat-value">${activeEmps.length}</div>
        <div class="stat-delta"><span class="up">↑ Active</span> · ${APP_STATE.employees.filter(e=>e.status==='Inactive').length} inactive</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-accent" style="background:var(--green)"></div>
        <div class="stat-label">Present Today</div>
        <div class="stat-value">${present}</div>
        <div class="stat-delta"><span class="${attPct>=80?'up':'down'}">${attPct}% attendance</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-accent" style="background:var(--amber)"></div>
        <div class="stat-label">On Leave / Absent</div>
        <div class="stat-value">${onLeave+absent}</div>
        <div class="stat-delta">${onLeave} on leave · ${absent} absent</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-accent" style="background:var(--purple)"></div>
        <div class="stat-label">Est. Monthly Payroll</div>
        <div class="stat-value" style="font-size:1.5rem">${fmtMoney(monthPay)}</div>
        <div class="stat-delta">${activeEmps.length} employees · 26 days</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header"><div class="card-title">Attendance This Week</div></div>
        <div class="bar-chart">${bars}</div>
        <div style="margin-top:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text3);margin-bottom:4px">
            <span>Today's attendance</span><span style="color:var(--text);font-weight:700">${attPct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${attPct}%;background:${attPct>=80?'var(--green)':attPct>=60?'var(--amber)':'var(--red)'}"></div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Recent Activity</div></div>
        <div class="activity-feed">${actFeed||'<div class="empty-state" style="padding:20px">No activity yet</div>'}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Today's Shifts</div>
          <button class="btn btn-secondary btn-sm" onclick="navigate('shifts')">Manage →</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">${shiftRows}</div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Pending Approvals</div>
          <span class="badge badge-amber">${pendLeaves.length}</span>
        </div>
        <div class="activity-feed">${pendRows}</div>
        ${pendLeaves.length>4?`<div style="text-align:center;margin-top:12px"><button class="btn btn-secondary btn-sm" onclick="navigate('leaves')">View all ${pendLeaves.length}</button></div>`:''}
      </div>
    </div>`;

  window.quickApprove = async function(id) {
    await DB.updateLeave(id,{status:'Approved'});
    await DB.logActivity('Leave approved','',  '#10B981');
    showToast('Leave approved','success');
    await loadNotifications();
    renderDashboard();
  };
  window.quickReject = async function(id) {
    await DB.updateLeave(id,{status:'Rejected'});
    showToast('Leave rejected','info');
    await loadNotifications();
    renderDashboard();
  };
};
