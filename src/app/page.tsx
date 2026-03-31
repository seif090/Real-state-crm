"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  BarChart3, 
  MessageSquare,
  Target, 
  Home, 
  ShieldCheck, 
  Zap, 
  ArrowLeft 
} from "lucide-react";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={`${styles.nav} glass`}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Zap size={24} fill="var(--primary)" />
            AI عقارات CRM
          </div>
          <div className={styles.navLinks}>
            <Link href="/login" className="btn btn-outline" style={{ marginLeft: '12px' }}>
              تسجيل الدخول
            </Link>
            <Link href="/register" className="btn btn-primary">
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <span className={`${styles.badge} animate-fade-in`}>
            ✨ مستقبل إدارة العقارات هنا
          </span>
          <h1 className={`${styles.title} text-gradient animate-fade-in`}>
            حوّل استفسارات واتساب إلى <br />
            صفقات عقارية ناجحة 
          </h1>
          <p className={`${styles.subtitle} animate-fade-in`}>
            منصة متكاملة لإدارة العملاء مدعومة بالذكاء الاصطناعي، تساعدك على تتبع Leads، إدارة الوحدات، والرد الآلي الذكي عبر واتساب.
          </p>
          
          <div className={`${styles.ctaGroup} animate-fade-in`}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              احصل على نسخة تجريبية
            </Link>
            <Link href="#features" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
               اكتشف المميزات
            </Link>
          </div>

          <div className={`${styles.dashboardPreview} animate-fade-in`}>
            <Image 
              src="/hero-dashboard.png" 
              alt="Dashboard Preview" 
              width={1200} 
              height={675}
              priority
              style={{ width: '100%', height: 'auto', borderRadius: 'inherit' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.heroContainer}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px' }} className="text-gradient">
            كل ما تحتاجه لإدارة شركتك العقارية
          </h2>
          
          <div className={styles.featureGrid}>
            <FeatureCard 
              icon={<Target size={28} />}
              title="إدارة العملاء (Leads)"
              description="تتبع كل عميل من أول رسالة على واتساب وحتى إغلاق الصفقة (Sold) مع نظام Kanban متطور."
            />
            <FeatureCard 
              icon={<MessageSquare size={28} />}
              title="تكامل واتساب الذكي"
              description="استقبل الرسائل وأنشئ Lead تلقائياً. الردود الذكية تحفظ وقت فريق المبيعات."
            />
            <FeatureCard 
              icon={<ShieldCheck size={28} />}
              title="بوت المحادثة AI"
              description="ذكاء اصطناعي يفهم نية العميل ويقترح له العقارات المناسبة من قاعدة بياناتك."
            />
            <FeatureCard 
              icon={<Home size={28} />}
              title="إدارة محفظة العقارات"
              description="نظم وحداتك السكنية والتجارية، المساحات، والأسعار في مكان واحد سهل الوصول."
            />
            <FeatureCard 
              icon={<BarChart3 size={28} />}
              title="تقارير الأداء"
              description="لوحة تحكم تحليلية تظهر أداء الموظفين ونسبة التحويل والإيرادات المتوقعة."
            />
            <FeatureCard 
              icon={<Zap size={28} />}
              title="نظام SaaS متكامل"
              description="وصول آمن لكل فريقك من أي مكان، مع إدارة كاملة للصلاحيات والأدوار."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '20px' }}>جاهز لتطوير أعمالك؟</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
            انضم إلى مئات الشركات العقارية التي تستخدم منصتنا لزيادة المبيعات.
          </p>
          <Link href="/register" className="btn btn-primary">
            انضم إلينا الآن <ArrowLeft size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className={`${styles.featureCard} glass-card`}>
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{description}</p>
    </div>
  );
}
