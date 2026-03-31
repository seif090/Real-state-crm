export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "VIEWING"
  | "NEGOTIATING"
  | "CANCELLED"
  | "SOLD";

export type LeadScore = "HOT" | "WARM" | "COLD";

export type LeadSource = "WHATSAPP" | "WEB" | "REFERRAL" | "CALL";

export type PropertyStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type PropertyType = "Apartment" | "Villa" | "Office" | "Townhouse";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  score: LeadScore;
  source: LeadSource;
  budget: number;
  preferredLocation: string;
  lastTouch: string;
  nextFollowUp: string;
  propertyId?: string;
  notesCount: number;
  messagesCount: number;
};

export type PropertySummary = {
  id: string;
  name: string;
  location: string;
  type: PropertyType;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  tags: string[];
};

export type TeamMember = {
  id: string;
  name: string;
  role: "Sales Agent" | "Team Lead" | "Admin";
  status: "Online" | "Away" | "Offline";
  leadsAssigned: number;
  closedDeals: number;
  avgResponseMinutes: number;
};

export const leads: Lead[] = [
  {
    id: "lead-1",
    name: "محمد علي",
    phone: "01023456789",
    status: "NEW",
    score: "HOT",
    source: "WHATSAPP",
    budget: 2500000,
    preferredLocation: "التجمع",
    lastTouch: "2026-04-01T06:30:00.000Z",
    nextFollowUp: "2026-04-01T11:30:00.000Z",
    propertyId: "prop-1",
    notesCount: 3,
    messagesCount: 8,
  },
  {
    id: "lead-2",
    name: "سارة محمود",
    phone: "01123456789",
    status: "CONTACTED",
    score: "WARM",
    source: "WEB",
    budget: 1200000,
    preferredLocation: "مدينة نصر",
    lastTouch: "2026-03-31T18:15:00.000Z",
    nextFollowUp: "2026-04-02T09:00:00.000Z",
    propertyId: "prop-4",
    notesCount: 2,
    messagesCount: 5,
  },
  {
    id: "lead-3",
    name: "شركة النور",
    phone: "01223456789",
    status: "INTERESTED",
    score: "HOT",
    source: "REFERRAL",
    budget: 5000000,
    preferredLocation: "العاصمة",
    lastTouch: "2026-03-30T12:00:00.000Z",
    nextFollowUp: "2026-04-01T15:00:00.000Z",
    propertyId: "prop-3",
    notesCount: 5,
    messagesCount: 12,
  },
  {
    id: "lead-4",
    name: "أحمد حسن",
    phone: "01523456789",
    status: "VIEWING",
    score: "COLD",
    source: "CALL",
    budget: 3800000,
    preferredLocation: "الشيخ زايد",
    lastTouch: "2026-04-01T04:00:00.000Z",
    nextFollowUp: "2026-04-01T20:00:00.000Z",
    propertyId: "prop-2",
    notesCount: 4,
    messagesCount: 4,
  },
  {
    id: "lead-5",
    name: "مروة سامي",
    phone: "01055512345",
    status: "NEGOTIATING",
    score: "HOT",
    source: "WHATSAPP",
    budget: 7100000,
    preferredLocation: "التجمع",
    lastTouch: "2026-04-01T05:45:00.000Z",
    nextFollowUp: "2026-04-01T13:00:00.000Z",
    propertyId: "prop-5",
    notesCount: 6,
    messagesCount: 10,
  },
  {
    id: "lead-6",
    name: "داليا منصور",
    phone: "01088832111",
    status: "SOLD",
    score: "WARM",
    source: "WEB",
    budget: 9200000,
    preferredLocation: "الشيخ زايد",
    lastTouch: "2026-03-29T16:20:00.000Z",
    nextFollowUp: "2026-04-05T10:00:00.000Z",
    propertyId: "prop-2",
    notesCount: 8,
    messagesCount: 14,
  },
];

export const properties: PropertySummary[] = [
  {
    id: "prop-1",
    name: "شقة ريفر سايد",
    location: "التجمع الخامس",
    type: "Apartment",
    price: 3500000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    status: "AVAILABLE",
    tags: ["New launch", "High demand", "Family"],
  },
  {
    id: "prop-2",
    name: "فيلا مارينا",
    location: "الشيخ زايد",
    type: "Villa",
    price: 12000000,
    area: 450,
    bedrooms: 5,
    bathrooms: 4,
    status: "RESERVED",
    tags: ["Premium", "Reserved", "Garden"],
  },
  {
    id: "prop-3",
    name: "برج الأعمال المركزي",
    location: "العاصمة الإدارية",
    type: "Office",
    price: 5200000,
    area: 90,
    bedrooms: 0,
    bathrooms: 1,
    status: "AVAILABLE",
    tags: ["Office", "Investment", "Cash flow"],
  },
  {
    id: "prop-4",
    name: "دوبلكس النخيل",
    location: "مدينة نصر",
    type: "Townhouse",
    price: 2800000,
    area: 210,
    bedrooms: 4,
    bathrooms: 3,
    status: "AVAILABLE",
    tags: ["Flexible", "Fast close", "Urban"],
  },
  {
    id: "prop-5",
    name: "بنتهاوس سكاي لايت",
    location: "التجمع الخامس",
    type: "Apartment",
    price: 7900000,
    area: 240,
    bedrooms: 4,
    bathrooms: 3,
    status: "AVAILABLE",
    tags: ["View", "Luxury", "Hot lead"],
  },
  {
    id: "prop-6",
    name: "مكتب تكنولوجي بارك",
    location: "القرنفل",
    type: "Office",
    price: 6400000,
    area: 140,
    bedrooms: 0,
    bathrooms: 2,
    status: "AVAILABLE",
    tags: ["Commercial", "Tech", "Ready"],
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "agent-1",
    name: "أحمد فؤاد",
    role: "Team Lead",
    status: "Online",
    leadsAssigned: 24,
    closedDeals: 11,
    avgResponseMinutes: 9,
  },
  {
    id: "agent-2",
    name: "سارة عادل",
    role: "Sales Agent",
    status: "Online",
    leadsAssigned: 18,
    closedDeals: 7,
    avgResponseMinutes: 12,
  },
  {
    id: "agent-3",
    name: "محمود سامي",
    role: "Sales Agent",
    status: "Away",
    leadsAssigned: 15,
    closedDeals: 9,
    avgResponseMinutes: 18,
  },
  {
    id: "agent-4",
    name: "نهى محمود",
    role: "Admin",
    status: "Offline",
    leadsAssigned: 8,
    closedDeals: 3,
    avgResponseMinutes: 20,
  },
];

export const leadPipeline: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "VIEWING",
  "NEGOTIATING",
  "CANCELLED",
  "SOLD",
];

export function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("en-US").format(Math.round(amount))} ج.م`;
}

export function getLeadNextAction(lead: Lead) {
  const actions: Record<LeadStatus, string> = {
    NEW: "اتصال أولي خلال 30 دقيقة",
    CONTACTED: "إرسال بروشور ومراجعة الميزانية",
    INTERESTED: "اقتراح زيارتين للمعاينة",
    VIEWING: "جمع ملاحظات العميل بعد المعاينة",
    NEGOTIATING: "إرسال العرض النهائي وتثبيت الحجز",
    CANCELLED: "مراجعة سبب الإلغاء وإعادة التأهيل لاحقاً",
    SOLD: "متابعة ما بعد البيع والتسليم",
  };

  return actions[lead.status];
}

export function getLeadPriorityWeight(lead: Lead) {
  const scoreWeight: Record<LeadScore, number> = { HOT: 3, WARM: 2, COLD: 1 };
  const statusWeight: Record<LeadStatus, number> = {
    NEW: 2,
    CONTACTED: 3,
    INTERESTED: 4,
    VIEWING: 5,
    NEGOTIATING: 6,
    CANCELLED: 1,
    SOLD: 1,
  };

  const followUpOverdue = Date.parse(lead.nextFollowUp) < Date.now() ? 2 : 0;
  return scoreWeight[lead.score] * 10 + statusWeight[lead.status] * 3 + followUpOverdue;
}

export function getPropertyFitScore(lead: Lead, property: PropertySummary) {
  let score = 25;

  if (property.status === "AVAILABLE") score += 20;
  if (property.price <= lead.budget) score += 25;
  if (property.location.includes(lead.preferredLocation)) score += 20;
  if (lead.score === "HOT") score += 10;
  if (property.type === "Apartment" && lead.budget < 6000000) score += 5;
  if (property.type === "Villa" && lead.budget >= 8000000) score += 5;
  if (property.type === "Office" && lead.preferredLocation.includes("العاصمة")) score += 5;

  return Math.max(0, Math.min(100, score));
}

export function getDashboardMetrics() {
  const totalLeads = leads.length;
  const hotLeads = leads.filter((lead) => lead.score === "HOT").length;
  const activeLeads = leads.filter((lead) => lead.status !== "SOLD").length;
  const closedDeals = leads.filter((lead) => lead.status === "SOLD").length;
  const overdueFollowUps = leads.filter(
    (lead) => Date.parse(lead.nextFollowUp) < Date.now() && lead.status !== "SOLD"
  ).length;

  const expectedRevenue = leads.reduce((sum, lead) => {
    const multiplier = lead.score === "HOT" ? 0.72 : lead.score === "WARM" ? 0.46 : 0.24;
    return sum + lead.budget * multiplier;
  }, 0);

  const pipeline = leadPipeline.map((status) => {
    const count = leads.filter((lead) => lead.status === status).length;
    return {
      status,
      count,
      label: getPipelineLabel(status),
    };
  });

  const topLeads = [...leads]
    .sort((a, b) => getLeadPriorityWeight(b) - getLeadPriorityWeight(a))
    .slice(0, 3);

  const leadMatches = leads
    .map((lead) => {
      const bestMatches = [...properties]
        .map((property) => ({
          property,
          fitScore: getPropertyFitScore(lead, property),
        }))
        .sort((a, b) => b.fitScore - a.fitScore)
        .slice(0, 2);

      return {
        lead,
        bestMatches,
      };
    })
    .filter((item) => item.bestMatches[0]?.fitScore >= 65)
    .slice(0, 4);

  const recommendations = buildRecommendations({
    hotLeads,
    overdueFollowUps,
    closedDeals,
    activeLeads,
  });

  return {
    totalLeads,
    hotLeads,
    activeLeads,
    closedDeals,
    overdueFollowUps,
    expectedRevenue,
    pipeline,
    topLeads,
    leadMatches,
    recommendations,
  };
}

function getPipelineLabel(status: LeadStatus) {
  const labels: Record<LeadStatus, string> = {
    NEW: "جديد",
    CONTACTED: "تم التواصل",
    INTERESTED: "مهتم",
    VIEWING: "معاينة",
    NEGOTIATING: "تفاوض",
    CANCELLED: "ملغي",
    SOLD: "مغلقة",
  };

  return labels[status];
}

function buildRecommendations({
  hotLeads,
  overdueFollowUps,
  closedDeals,
  activeLeads,
}: {
  hotLeads: number;
  overdueFollowUps: number;
  closedDeals: number;
  activeLeads: number;
}) {
  const notes = [
    {
      title: "أولوية المتابعة",
      detail:
        overdueFollowUps > 0
          ? `هناك ${overdueFollowUps} عميل يحتاج متابعة فورية.`
          : "لا توجد متابعات متأخرة حاليا.",
    },
    {
      title: "الصفقات الساخنة",
      detail:
        hotLeads > 0
          ? `${hotLeads} عميل مصنف HOT جاهز للحسم هذا الأسبوع.`
          : "لا توجد صفقات ساخنة حاليا.",
    },
    {
      title: "مؤشر الإغلاق",
      detail: `${closedDeals} صفقة مغلقة من أصل ${activeLeads + closedDeals} عميل ظاهر في القمع.`,
    },
  ];

  return notes;
}
