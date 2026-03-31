"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap, Mail, Lock, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import styles from "../auth.module.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("خطأ في تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass-card`}>
        <div className={styles.logo}>
          <Zap size={32} fill="var(--primary)" />
          <span>AI عقارات CRM</span>
        </div>

        <h1 className={styles.title}>تسجيل الدخول</h1>
        <p className={styles.subtitle}>مرحباً بك مجدداً في منصتك العقارية</p>

        {error && (
          <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
            {loading ? "جاري التحميل..." : "دخول"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className={styles.footer}>
          ليس لديك حساب؟ 
          <Link href="/register" className={styles.footerLink}>سجل شركتك الآن</Link>
        </div>
      </div>
    </div>
  )
}
