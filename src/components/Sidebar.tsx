"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  MessageSquare, 
  Target, 
  Home, 
  Settings, 
  Users, 
  LogOut,
  Zap,
  Sparkles
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import styles from "./Sidebar.module.css"

const menuItems = [
  { name: "لوحة التحكم", icon: <BarChart3 size={20} />, href: "/dashboard" },
  { name: "العملاء المهتمين (Leads)", icon: <Target size={20} />, href: "/dashboard/leads" },
  { name: "المحادثات", icon: <MessageSquare size={20} />, href: "/dashboard/messages" },
  { name: "العقارات", icon: <Home size={20} />, href: "/dashboard/properties" },
  { name: "التحليلات", icon: <BarChart3 size={20} />, href: "/dashboard/analytics" },
  { name: "AI Copilot", icon: <Sparkles size={20} />, href: "/dashboard/assistant" },
  { name: "الفريق", icon: <Users size={20} />, href: "/dashboard/team" },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.logo}>
        <Zap size={24} fill="var(--primary)" />
        <span>AI عقارات CRM</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {item.icon}
              <span className={styles.navText}>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/dashboard/settings" className={styles.navItem}>
          <Settings size={20} />
          <span className={styles.navText}>الإعدادات</span>
        </Link>
        <button onClick={handleLogout} className={`${styles.navItem} ${styles.logout}`}>
          <LogOut size={20} />
          <span className={styles.navText}>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}
