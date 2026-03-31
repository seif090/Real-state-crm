"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'; // Switching to Recharts as it's easier for React
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
} from "lucide-react"

const barData = [
  { name: 'يناير', sales: 4000 },
  { name: 'فبراير', sales: 3000 },
  { name: 'مارس', sales: 2000 },
  { name: 'أبريل', sales: 2780 },
  { name: 'مايو', sales: 1890 },
  { name: 'يونيو', sales: 2390 },
];

const pieData = [
  { name: 'واتساب', value: 400 },
  { name: 'الموقع الإلكتروني', value: 300 },
  { name: 'اتصال مباشر', value: 200 },
  { name: 'تواصل اجتماعي', value: 100 },
];

const COLORS = ['#00bfa5', '#3d5afe', '#ff9800', '#ff5252'];

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', direction: 'rtl' }}>
      <header>
        <h1>التحليلات والتقارير</h1>
        <p style={{ color: 'var(--muted)' }}>تتبع أداء الشركة ونمو المبيعات</p>
      </header>

      {/* Analytics Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Sales Trend Chart */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem' }}>نمو المبيعات الشهرية</h2>
            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} />
              <span style={{ fontWeight: 600 }}>+15%</span>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>مصادر العملاء</h2>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            {pieData.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[index] }}></span>
                  <span style={{ color: 'var(--muted)' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>%{ (item.value / 1000 * 100).toFixed(0) }</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extra KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
               <DollarSign color="var(--primary)" size={20} />
               <span>العائد المتوقع</span>
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>45,200,000 ج.م</h3>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
               <Users color="var(--accent)" size={20} />
               <span>معدل التحويل</span>
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>18.4%</h3>
          </div>
      </div>
    </div>
  )
}
