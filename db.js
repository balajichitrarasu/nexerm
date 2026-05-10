// NexERM — Database Layer (Supabase + localStorage fallback)

let supabase = null;

async function initSupabase() {
  if (!SUPABASE_CONFIGURED) return null;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(NEXERM_CONFIG.SUPABASE_URL, NEXERM_CONFIG.SUPABASE_ANON_KEY);
    return supabase;
  } catch (e) { console.warn('Supabase load failed, using localStorage', e); return null; }
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function buildSeedData() {
  const today = todayStr();
  return {
    company: { name:'Demo Company Pvt Ltd', industry:'Technology' },
    departments: [
      {id:'d1',name:'Engineering', head:'EMP001',color:'#2563EB'},
      {id:'d2',name:'Sales',       head:'EMP003',color:'#10B981'},
      {id:'d3',name:'HR',          head:'EMP004',color:'#8B5CF6'},
      {id:'d4',name:'Operations',  head:'EMP005',color:'#F59E0B'},
      {id:'d5',name:'Finance',     head:'EMP006',color:'#06B6D4'},
    ],
    shifts: [
      {id:'s1',name:'Morning',   start:'06:00',end:'14:00',color:'#F59E0B'},
      {id:'s2',name:'Afternoon', start:'14:00',end:'22:00',color:'#2563EB'},
      {id:'s3',name:'Night',     start:'22:00',end:'06:00',color:'#8B5CF6'},
      {id:'s4',name:'General',   start:'09:00',end:'18:00',color:'#10B981'},
    ],
    employees: [
      {id:'EMP001',first:'Arjun',  last:'Kumar',  email:'arjun@demo.com',  phone:'9876543210',dept_id:'d1',shift_id:'s4',role:'Software Engineer', salary_per_day:2800,status:'Active',  join_date:'2023-01-10',gender:'Male',  blood:'O+'},
      {id:'EMP002',first:'Priya',  last:'Sharma', email:'priya@demo.com',  phone:'9876543211',dept_id:'d1',shift_id:'s2',role:'QA Engineer',        salary_per_day:2200,status:'Active',  join_date:'2023-03-15',gender:'Female',blood:'A+'},
      {id:'EMP003',first:'Rohit',  last:'Singh',  email:'rohit@demo.com',  phone:'9876543212',dept_id:'d2',shift_id:'s4',role:'Sales Manager',      salary_per_day:3000,status:'Active',  join_date:'2022-11-01',gender:'Male',  blood:'B+'},
      {id:'EMP004',first:'Meena',  last:'Nair',   email:'meena@demo.com',  phone:'9876543213',dept_id:'d3',shift_id:'s4',role:'HR Executive',       salary_per_day:2100,status:'Active',  join_date:'2023-06-20',gender:'Female',blood:'O-'},
      {id:'EMP005',first:'Vikram', last:'Patel',  email:'vikram@demo.com', phone:'9876543214',dept_id:'d4',shift_id:'s3',role:'Operations Lead',    salary_per_day:2700,status:'Active',  join_date:'2022-08-05',gender:'Male',  blood:'AB+'},
      {id:'EMP006',first:'Divya',  last:'Rao',    email:'divya@demo.com',  phone:'9876543215',dept_id:'d5',shift_id:'s4',role:'Accountant',         salary_per_day:2200,status:'Active',  join_date:'2023-02-14',gender:'Female',blood:'A-'},
      {id:'EMP007',first:'Suresh', last:'Babu',   email:'suresh@demo.com', phone:'9876543216',dept_id:'d1',shift_id:'s3',role:'DevOps Engineer',    salary_per_day:2900,status:'Active',  join_date:'2022-09-30',gender:'Male',  blood:'B-'},
      {id:'EMP008',first:'Kavitha',last:'Menon',  email:'kavitha@demo.com',phone:'9876543217',dept_id:'d2',shift_id:'s2',role:'Sales Executive',    salary_per_day:1900,status:'Inactive',join_date:'2023-04-11',gender:'Female',blood:'O+'},
      {id:'EMP009',first:'Arun',   last:'Dev',    email:'arun@demo.com',   phone:'9876543218',dept_id:'d1',shift_id:'s1',role:'Frontend Developer', salary_per_day:2500,status:'Active',  join_date:'2024-01-05',gender:'Male',  blood:'A+'},
      {id:'EMP010',first:'Sneha',  last:'Krishnan',email:'sneha@demo.com', phone:'9876543219',dept_id:'d3',shift_id:'s4',role:'HR Manager',         salary_per_day:3200,status:'Active',  join_date:'2022-06-01',gender:'Female',blood:'B+'},
    ],
    attendance: buildSampleAtt(today),
    leaves: [
      {id:'L001',emp_id:'EMP003',type:'Sick Leave',  from_date:today,to_date:today,days:1,reason:'Fever',        status:'Pending', applied_on:today},
      {id:'L002',emp_id:'EMP006',type:'Casual Leave',from_date:today,to_date:today,days:1,reason:'Personal work',status:'Pending', applied_on:today},
      {id:'L003',emp_id:'EMP002',type:'Annual Leave', from_date:'2026-04-28',to_date:'2026-04-30',days:3,reason:'Vacation',status:'Approved',applied_on:'2026-04-20'},
    ],
    activity: [
      {id:'a1',text:'Arjun Kumar checked in',  detail:'General · 09:02 AM', time:'Today 9:02 AM', color:'#10B981'},
      {id:'a2',text:'Leave request submitted', detail:'Rohit Singh · Sick', time:'Today 8:30 AM', color:'#F59E0B'},
      {id:'a3',text:'Payroll processed',       detail:'April 2026',         time:'Apr 30',         color:'#8B5CF6'},
      {id:'a4',text:'New employee added',      detail:'Arun Dev',           time:'Jan 5',          color:'#2563EB'},
      {id:'a5',text:'Meena Nair checked in',   detail:'General · 09:05 AM', time:'Today 9:05 AM', color:'#10B981'},
    ],
    settings: {
      company_name:'Demo Company Pvt Ltd',
      work_hours:8,ot_rate:1.5,pf_percent:12,tax_percent:5,leave_days:24,currency:'₹'
    }
  };
}

function buildSampleAtt(date) {
  const att = {};
  ['EMP001','EMP002','EMP003','EMP004','EMP005','EMP006','EMP007','EMP008','EMP009','EMP010'].forEach(id => {
    att[`${date}_${id}`] = {
      id:`att_${date}_${id}`,date,emp_id:id,
      check_in: (id==='EMP008'||id==='EMP003') ? null : `0${8+Math.floor(Math.random()*2)}:${String(Math.floor(Math.random()*30)).padStart(2,'0')}`,
      check_out: null,
      status: id==='EMP008'?'Absent':id==='EMP003'?'On Leave':'Present',
      overtime_hrs:0,note:''
    };
  });
  return att;
}

function getDemoData() {
  try {
    const saved = localStorage.getItem('nexerm_v2');
    return saved ? JSON.parse(saved) : buildSeedData();
  } catch(e) { return buildSeedData(); }
}
function saveDemoData(data) {
  try { localStorage.setItem('nexerm_v2', JSON.stringify(data)); } catch(e){}
}

const DB = {
  _data: null,

  async init() {
    await initSupabase();
    this._data = getDemoData();
  },

  // COMPANY
  async getCompany() {
    if (supabase) { const {data}=await supabase.from('company').select('*').single(); return data; }
    return this._data.company;
  },
  async updateCompany(u) {
    if (supabase) { const {data}=await supabase.from('company').update(u).select().single(); return data; }
    Object.assign(this._data.company,u); saveDemoData(this._data); return this._data.company;
  },

  // DEPARTMENTS
  async getDepartments() {
    if (supabase) { const {data}=await supabase.from('departments').select('*').order('name'); return data||[]; }
    return [...this._data.departments];
  },
  async addDepartment(d) {
    if (supabase) { const {data}=await supabase.from('departments').insert(d).select().single(); return data; }
    const nd={...d,id:'d'+Date.now()}; this._data.departments.push(nd); saveDemoData(this._data); return nd;
  },
  async updateDepartment(id,u) {
    if (supabase) { const {data}=await supabase.from('departments').update(u).eq('id',id).select().single(); return data; }
    const i=this._data.departments.findIndex(x=>x.id===id);
    if(i!==-1){Object.assign(this._data.departments[i],u);saveDemoData(this._data);}
    return this._data.departments[i];
  },
  async deleteDepartment(id) {
    if (supabase) { await supabase.from('departments').delete().eq('id',id); return; }
    this._data.departments=this._data.departments.filter(x=>x.id!==id); saveDemoData(this._data);
  },

  // SHIFTS
  async getShifts() {
    if (supabase) { const {data}=await supabase.from('shifts').select('*').order('name'); return data||[]; }
    return [...this._data.shifts];
  },
  async addShift(s) {
    if (supabase) { const {data}=await supabase.from('shifts').insert(s).select().single(); return data; }
    const ns={...s,id:'s'+Date.now()}; this._data.shifts.push(ns); saveDemoData(this._data); return ns;
  },
  async updateShift(id,u) {
    if (supabase) { const {data}=await supabase.from('shifts').update(u).eq('id',id).select().single(); return data; }
    const i=this._data.shifts.findIndex(x=>x.id===id);
    if(i!==-1){Object.assign(this._data.shifts[i],u);saveDemoData(this._data);}
    return this._data.shifts[i];
  },
  async deleteShift(id) {
    if (supabase) { await supabase.from('shifts').delete().eq('id',id); return; }
    this._data.shifts=this._data.shifts.filter(x=>x.id!==id); saveDemoData(this._data);
  },

  // EMPLOYEES
  async getEmployees(f={}) {
    if (supabase) {
      let q=supabase.from('employees').select('*');
      if(f.status) q=q.eq('status',f.status);
      if(f.dept_id) q=q.eq('dept_id',f.dept_id);
      if(f.shift_id) q=q.eq('shift_id',f.shift_id);
      if(f.search) q=q.or(`first.ilike.%${f.search}%,last.ilike.%${f.search}%,id.ilike.%${f.search}%`);
      const {data}=await q.order('first'); return data||[];
    }
    let e=[...this._data.employees];
    if(f.status) e=e.filter(x=>x.status===f.status);
    if(f.dept_id) e=e.filter(x=>x.dept_id===f.dept_id);
    if(f.shift_id) e=e.filter(x=>x.shift_id===f.shift_id);
    if(f.search){const s=f.search.toLowerCase();e=e.filter(x=>(x.first+' '+x.last).toLowerCase().includes(s)||x.id.toLowerCase().includes(s)||x.email.toLowerCase().includes(s));}
    return e;
  },
  async getEmployee(id) {
    if (supabase) { const {data}=await supabase.from('employees').select('*').eq('id',id).single(); return data; }
    return this._data.employees.find(e=>e.id===id)||null;
  },
  async addEmployee(emp) {
    if (supabase) { const {data}=await supabase.from('employees').insert(emp).select().single(); return data; }
    this._data.employees.push({...emp});
    this._data.activity.unshift({id:'a'+Date.now(),text:'New employee added',detail:`${emp.first} ${emp.last}`,time:'Just now',color:'#2563EB'});
    saveDemoData(this._data); return emp;
  },
  async updateEmployee(id,u) {
    if (supabase) { const {data}=await supabase.from('employees').update(u).eq('id',id).select().single(); return data; }
    const i=this._data.employees.findIndex(e=>e.id===id);
    if(i!==-1){Object.assign(this._data.employees[i],u);saveDemoData(this._data);}
    return this._data.employees[i];
  },
  async deleteEmployee(id) {
    if (supabase) { await supabase.from('employees').delete().eq('id',id); return; }
    this._data.employees=this._data.employees.filter(e=>e.id!==id); saveDemoData(this._data);
  },

  // ATTENDANCE
  async getAttendance(date) {
    if (supabase) { const {data}=await supabase.from('attendance').select('*').eq('date',date); return data||[]; }
    return Object.values(this._data.attendance).filter(a=>a.date===date);
  },
  async getAttendanceRange(from,to) {
    if (supabase) { const {data}=await supabase.from('attendance').select('*').gte('date',from).lte('date',to); return data||[]; }
    return Object.values(this._data.attendance).filter(a=>a.date>=from&&a.date<=to);
  },
  async upsertAttendance(rec) {
    if (supabase) { const {data}=await supabase.from('attendance').upsert(rec,{onConflict:'date,emp_id'}).select().single(); return data; }
    const key=`${rec.date}_${rec.emp_id}`;
    this._data.attendance[key]={...(this._data.attendance[key]||{}), ...rec, id:key};
    saveDemoData(this._data); return this._data.attendance[key];
  },

  // LEAVES
  async getLeaves(f={}) {
    if (supabase) {
      let q=supabase.from('leaves').select('*').order('applied_on',{ascending:false});
      if(f.status) q=q.eq('status',f.status);
      if(f.emp_id) q=q.eq('emp_id',f.emp_id);
      const {data}=await q; return data||[];
    }
    let l=[...this._data.leaves].reverse();
    if(f.status) l=l.filter(x=>x.status===f.status);
    if(f.emp_id) l=l.filter(x=>x.emp_id===f.emp_id);
    return l;
  },
  async addLeave(leave) {
    if (supabase) { const {data}=await supabase.from('leaves').insert(leave).select().single(); return data; }
    const nl={...leave,id:'L'+Date.now()}; this._data.leaves.push(nl); saveDemoData(this._data); return nl;
  },
  async updateLeave(id,u) {
    if (supabase) { const {data}=await supabase.from('leaves').update(u).eq('id',id).select().single(); return data; }
    const i=this._data.leaves.findIndex(l=>l.id===id);
    if(i!==-1){Object.assign(this._data.leaves[i],u);saveDemoData(this._data);}
    return this._data.leaves[i];
  },
  async deleteLeave(id) {
    if (supabase) { await supabase.from('leaves').delete().eq('id',id); return; }
    this._data.leaves=this._data.leaves.filter(l=>l.id!==id); saveDemoData(this._data);
  },

  // ACTIVITY
  async getActivity(limit=10) {
    if (supabase) { const {data}=await supabase.from('activity').select('*').order('created_at',{ascending:false}).limit(limit); return data||[]; }
    return this._data.activity.slice(0,limit);
  },
  async logActivity(text,detail,color='#2563EB') {
    const rec={text,detail,color,time:'Just now'};
    if (supabase) { await supabase.from('activity').insert(rec); return; }
    this._data.activity.unshift({...rec,id:'a'+Date.now()});
    if(this._data.activity.length>50) this._data.activity=this._data.activity.slice(0,50);
    saveDemoData(this._data);
  },

  // SETTINGS
  async getSettings() {
    if (supabase) { const {data}=await supabase.from('settings').select('*').single(); return data; }
    return this._data.settings;
  },
  async updateSettings(u) {
    if (supabase) { const {data}=await supabase.from('settings').update(u).select().single(); return data; }
    Object.assign(this._data.settings,u); saveDemoData(this._data); return this._data.settings;
  },
};
