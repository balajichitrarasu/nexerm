// NexERM — Settings Page
window.renderSettings = async function() {
  const settings = await DB.getSettings();
  const company  = await DB.getCompany();

  el('pageArea').innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><div class="page-title-lg">Settings</div><div class="page-sub">Configure your ERM workspace</div></div>
    </div>

    ${!SUPABASE_CONFIGURED ? `<div class="setup-alert">
      <div class="setup-alert-icon">⚠️</div>
      <div>
        <div class="setup-alert-title">Running in Demo Mode</div>
        <div class="setup-alert-text">You're using localStorage (demo). To enable real backend with user accounts, connect Supabase by editing <code>js/config.js</code> with your project URL and anon key. See the deployment guide for step-by-step instructions.</div>
      </div>
    </div>` : `<div class="setup-alert" style="background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.25)">
      <div class="setup-alert-icon">✅</div>
      <div>
        <div class="setup-alert-title" style="color:var(--green)">Supabase Connected</div>
        <div class="setup-alert-text">Your data is stored securely in Supabase PostgreSQL. User authentication is active.</div>
      </div>
    </div>`}

    <div class="settings-grid">

      <div class="card">
        <div class="settings-section-title">🏢 Company Information</div>
        <div class="form-group"><label>Company Name</label><input class="form-input" id="s-cname" value="${company?.name||settings?.company_name||''}"></div>
        <div class="form-group"><label>Industry</label>
          <select class="form-select" id="s-industry">
            ${['Technology','Manufacturing','Healthcare','Education','Finance','Retail','Other'].map(i=>`<option ${(company?.industry||'')==i?'selected':''}>${i}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Timezone</label>
          <select class="form-select" id="s-tz">
            ${['Asia/Kolkata','Asia/Dubai','Asia/Singapore','Europe/London','America/New_York','America/Los_Angeles'].map(t=>`<option ${(company?.timezone||'Asia/Kolkata')===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary" onclick="saveCompanySettings()">Save Company Info</button>
      </div>

      <div class="card">
        <div class="settings-section-title">💰 Payroll Configuration</div>
        <div class="form-group"><label>Working Hours / Day</label><input type="number" class="form-input" id="s-whours" value="${settings?.work_hours||8}" min="1" max="24"></div>
        <div class="form-group"><label>Overtime Rate (multiplier)</label><input type="number" class="form-input" id="s-otrate" value="${settings?.ot_rate||1.5}" step="0.1" min="1"></div>
        <div class="form-group"><label>PF Deduction %</label><input type="number" class="form-input" id="s-pf" value="${settings?.pf_percent||12}" min="0" max="100"></div>
        <div class="form-group"><label>Income Tax %</label><input type="number" class="form-input" id="s-tax" value="${settings?.tax_percent||5}" min="0" max="100"></div>
        <div class="form-group"><label>Leave Days / Year</label><input type="number" class="form-input" id="s-leave" value="${settings?.leave_days||24}" min="0"></div>
        <button class="btn btn-primary" onclick="savePayrollSettings()">Save Payroll Config</button>
      </div>

      <div class="card">
        <div class="settings-section-title">🔑 Change Password</div>
        ${SUPABASE_CONFIGURED ? `
          <div class="form-group"><label>Current Password</label><input type="password" class="form-input" id="s-oldpw" placeholder="••••••••"></div>
          <div class="form-group"><label>New Password</label><input type="password" class="form-input" id="s-newpw" placeholder="Min 8 characters"></div>
          <div class="form-group"><label>Confirm Password</label><input type="password" class="form-input" id="s-confirmpw" placeholder="Re-enter new password"></div>
          <button class="btn btn-primary" onclick="changePassword()">Update Password</button>`
        : `<div style="color:var(--text3);font-size:0.85rem;padding:12px 0">Password management requires Supabase authentication. Running in demo mode.</div>`}
      </div>

      <div class="card">
        <div class="settings-section-title">🗃️ Data Management</div>
        <p style="font-size:0.85rem;color:var(--text2);margin-bottom:16px;line-height:1.6">Export all your data as JSON for backup, or reset demo data.</p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-secondary" onclick="exportAllData()">⬇ Export All Data (JSON)</button>
          <button class="btn btn-secondary" onclick="exportAllData('csv')">⬇ Export Employees CSV</button>
          ${!SUPABASE_CONFIGURED?`<button class="btn btn-danger" onclick="resetDemoData()">⚠️ Reset Demo Data</button>`:''}
        </div>
      </div>

    </div>

    <div class="card" style="margin-top:16px">
      <div class="settings-section-title">ℹ️ About NexERM</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;font-size:0.85rem">
        <div><div style="color:var(--text3);margin-bottom:2px">Version</div><div style="font-weight:600">1.0.0</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">Backend</div><div style="font-weight:600">${SUPABASE_CONFIGURED?'Supabase (PostgreSQL)':'localStorage (Demo)'}</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">Hosting</div><div style="font-weight:600">GitHub Pages (Free)</div></div>
        <div><div style="color:var(--text3);margin-bottom:2px">License</div><div style="font-weight:600">MIT · Open Source</div></div>
      </div>
    </div>`;
};

window.saveCompanySettings = async function() {
  const name=val('s-cname'), industry=val('s-industry'), timezone=val('s-tz');
  if(!name) return showToast('Company name required','error');
  await DB.updateCompany({name, industry, timezone});
  await DB.updateSettings({company_name:name});
  APP_STATE.settings.company_name=name;
  el('sidebarCompany').textContent=name;
  showToast('Company info saved','success');
};

window.savePayrollSettings = async function() {
  await DB.updateSettings({
    work_hours:parseFloat(val('s-whours'))||8,
    ot_rate:parseFloat(val('s-otrate'))||1.5,
    pf_percent:parseFloat(val('s-pf'))||12,
    tax_percent:parseFloat(val('s-tax'))||5,
    leave_days:parseInt(val('s-leave'))||24,
  });
  showToast('Payroll config saved','success');
};

window.changePassword = async function() {
  const np=val('s-newpw'), cp=val('s-confirmpw');
  if(np!==cp) return showToast('Passwords do not match','error');
  if(np.length<8) return showToast('Password must be 8+ characters','error');
  if(!supabase) return showToast('Supabase not connected','error');
  const {error}=await supabase.auth.updateUser({password:np});
  if(error) return showToast(error.message,'error');
  showToast('Password updated','success');
};

window.exportAllData = async function(format='json') {
  if(format==='csv') {
    const emps=await DB.getEmployees();
    exportCSV(emps.map(e=>({ID:e.id,First:e.first,Last:e.last,Email:e.email,Phone:e.phone,Role:e.role,Status:e.status,SalaryPerDay:e.salary_per_day,JoinDate:e.join_date})),'nexerm_employees.csv');
  } else {
    const data=localStorage.getItem('nexerm_v2')||'{}';
    exportJSON(JSON.parse(data),'nexerm_backup.json');
  }
};

window.resetDemoData = function() {
  confirmDialog('This will clear all demo data and reload with sample data. Continue?', ()=>{
    localStorage.removeItem('nexerm_v2');
    showToast('Demo data reset','info');
    setTimeout(()=>location.reload(),1000);
  }, 'Reset', 'btn-danger');
};
