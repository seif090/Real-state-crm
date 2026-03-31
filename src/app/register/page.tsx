"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, Building, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import styles from "../auth.module.css"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          role: 'COMPANY_ADMIN',
        }
      }
    })

    if (authError) {
      setError("خطأ في إنشاء الحساب. " + authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // In a real app, we would also create the Company record in Prisma/Supabase DB
      // For now, redirect to login or dashboard
      router.push("/login?message=check-email")
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass-card`}>
        <div className={styles.logo}>
          <Zap size={32} fill="var(--primary)" />
          <span>AI عقارات CRM</span>
        </div>

        <h1 className={styles.title}>إنشاء حساب جديد</h1>
        <p className={styles.subtitle}>سجل شركتك اليوم وابدأ في تنظيم Leads</p>

        {error && (
          <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.label}>اسم الشركة العقارية</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="مثلاً: شركة المنار للتطوير العقاري"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required 
              />
              <Building size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary submitBtn" disabled={loading}>
            {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
            {!loading && <ArrowLeft size={20} />}
          </button>
        </form>

        <div className={styles.footer}>
          لديك حساب بالفعل؟ 
          <Link href="/login" className={styles.footerLink}>سجل دخولك</Link>
        </div>
      </div>
    </div>
  )
}
