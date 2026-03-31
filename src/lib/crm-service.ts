import "server-only";

import { prisma } from "@/lib/prisma";
import {
  leads as seedLeads,
  properties as seedProperties,
  teamMembers as seedTeamMembers,
  type Lead as UiLead,
  type PropertySummary as UiProperty,
  type TeamMember,
  getLeadNextAction,
  getLeadPriorityWeight,
  getPropertyFitScore,
  formatCurrency,
  leadPipeline,
} from "@/lib/crm-data";
import type { Lead, Message, Property } from "@/generated/prisma/client";

type ConversationMessage = {
  id: string;
  content: string;
  isIncoming: boolean;
  createdAt: string;
};

export type LeadThreadRecord = UiLead & {
  latestMessage?: string;
  latestMessageAt?: string;
  unreadCount: number;
  assignedProperty?: UiProperty;
};

const DEMO_COMPANY_NAME = "Demo Realty CRM";

let seedPromise: Promise<void> | null = null;

async function getCompanyId() {
  const company =
    (await prisma.company.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.company.create({
      data: { name: DEMO_COMPANY_NAME },
      select: { id: true },
    }));

  return company.id;
}

async function seedIfEmpty(companyId: string) {
  const [leadCount, propertyCount] = await Promise.all([
    prisma.lead.count({ where: { companyId } }),
    prisma.property.count({ where: { companyId } }),
  ]);

  if (leadCount > 0 || propertyCount > 0) {
    return;
  }

  await prisma.property.createMany({
    data: seedProperties.map((property) => ({
      companyId,
      name: property.name,
      location: property.location,
      type: property.type,
      price: property.price,
      area: property.area,
      bedrooms: property.bedrooms || null,
      bathrooms: property.bathrooms || null,
      description: property.tags.join(", "),
      images: [],
      status: property.status,
    })),
  });

  const createdProperties = await prisma.property.findMany({
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });

  const createdLeads = await prisma.lead.createMany({
    data: seedLeads.map((lead, index) => ({
      companyId,
      phone: lead.phone,
      name: lead.name,
      status: lead.status,
      score: lead.score,
      source: lead.source,
      budget: lead.budget,
      preferredLocation: lead.preferredLocation,
      propertyId: createdProperties[index % createdProperties.length]?.id,
    })),
  });

  if (createdLeads.count > 0) {
    const dbLeads = await prisma.lead.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });

    const firstLead = dbLeads[0];
    const secondLead = dbLeads[1];

    if (firstLead) {
      await prisma.message.createMany({
        data: [
          { leadId: firstLead.id, content: "أهلاً بك، كيف يمكنني مساعدتك؟", isIncoming: false },
          { leadId: firstLead.id, content: "أبحث عن شقة 3 غرف في التجمع.", isIncoming: true },
        ],
      });
      await prisma.note.create({
        data: {
          leadId: firstLead.id,
          content: "Hot lead. Follow up within 30 minutes.",
        },
      });
    }

    if (secondLead) {
      await prisma.message.createMany({
        data: [
          { leadId: secondLead.id, content: "شكراً على اهتمامك، أرسل لك التفاصيل.", isIncoming: false },
          { leadId: secondLead.id, content: "مناسب، لكن أحتاج معرفة السعر النهائي.", isIncoming: true },
        ],
      });
    }
  }
}

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const companyId = await getCompanyId();
      await seedIfEmpty(companyId);
    })();
  }

  await seedPromise;
}

function mapLead(lead: Lead): UiLead {
  return {
    id: lead.id,
    name: lead.name || "Unnamed lead",
    phone: lead.phone || "",
    status: lead.status,
    score: (lead.score || "COLD") as UiLead["score"],
    source: normalizeSource(lead.source),
    budget: lead.budget || 0,
    preferredLocation: lead.preferredLocation || "",
    lastTouch: lead.updatedAt.toISOString(),
    nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    propertyId: lead.propertyId || undefined,
    notesCount: 0,
    messagesCount: 0,
  };
}

function mapProperty(property: Property): UiProperty {
  return {
    id: property.id,
    name: property.name,
    location: property.location,
    type: property.type as UiProperty["type"],
    price: property.price,
    area: property.area,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    status: property.status,
    tags: property.description ? property.description.split(", ").filter(Boolean) : [],
  };
}

function normalizeSource(source: string): UiLead["source"] {
  if (source === "WEB_SITE") return "WEB";
  if (source === "MANUAL") return "CALL";
  if (source === "REFERRAL") return "REFERRAL";
  if (source === "CALL") return "CALL";
  if (source === "WEB") return "WEB";
  return "WHATSAPP";
}

export async function listLeads(): Promise<LeadThreadRecord[]> {
  try {
    await ensureSeeded();
    const leads = await prisma.lead.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        property: true,
        notes: true,
      },
    });

    return leads.map((lead) => {
      const mapped = mapLead(lead);
      return {
        ...mapped,
        notesCount: lead.notes.length,
        messagesCount: lead.messages.length,
        latestMessage: lead.messages[0]?.content,
        latestMessageAt: lead.messages[0]?.createdAt.toISOString(),
        unreadCount: lead.messages.filter((message) => message.isIncoming).length,
        assignedProperty: lead.property ? mapProperty(lead.property) : undefined,
      };
    });
  } catch (error) {
    console.error("Falling back to seed leads:", error);
    return seedLeads.map((lead) => ({
      ...lead,
      latestMessage: undefined,
      latestMessageAt: undefined,
      unreadCount: 0,
    }));
  }
}

export async function listProperties() {
  try {
    await ensureSeeded();
    const properties = await prisma.property.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return properties.map(mapProperty);
  } catch (error) {
    console.error("Falling back to seed properties:", error);
    return seedProperties;
  }
}

export async function getDashboardSnapshot() {
  const [leadList, propertyList, team] = await Promise.all([
    listLeads(),
    listProperties(),
    listTeamMembers(),
  ]);

  const totalLeads = leadList.length;
  const hotLeads = leadList.filter((lead) => lead.score === "HOT").length;
  const activeLeads = leadList.filter((lead) => lead.status !== "SOLD").length;
  const closedDeals = leadList.filter((lead) => lead.status === "SOLD").length;
  const overdueFollowUps = leadList.filter((lead) => Date.parse(lead.nextFollowUp) < Date.now() && lead.status !== "SOLD").length;
  const expectedRevenue = leadList.reduce((sum, lead) => {
    const multiplier = lead.score === "HOT" ? 0.72 : lead.score === "WARM" ? 0.46 : 0.24;
    return sum + lead.budget * multiplier;
  }, 0);

  const pipeline = leadPipeline.map((status) => ({
    status,
    count: leadList.filter((lead) => lead.status === status).length,
  }));

  const topLeads = [...leadList]
    .sort((a, b) => getLeadPriorityWeight(b) - getLeadPriorityWeight(a))
    .slice(0, 3);

  const leadMatches = leadList
    .map((lead) => ({
      lead,
      bestMatches: [...propertyList]
        .map((property) => ({ property, fitScore: getPropertyFitScore(lead, property) }))
        .sort((a, b) => b.fitScore - a.fitScore)
        .slice(0, 2),
    }))
    .filter((item) => item.bestMatches[0]?.fitScore >= 65)
    .slice(0, 4);

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
    recommendations: [
      {
        title: "Aging leads",
        detail:
          overdueFollowUps > 0
            ? `There are ${overdueFollowUps} overdue follow-ups waiting.`
            : "No overdue follow-ups right now.",
      },
      {
        title: "Hot opportunities",
        detail: `${hotLeads} leads are currently marked HOT.`,
      },
      {
        title: "Team readiness",
        detail: `${team.filter((member) => member.status === "Online").length} agents are online and available.`,
      },
    ],
  };
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  try {
    await ensureSeeded();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (users.length === 0) {
      return seedTeamMembers;
    }

    const leads = await prisma.lead.findMany({
      select: { agentId: true, id: true, updatedAt: true, status: true },
    });

    return users.map((user, index) => {
      const assigned = leads.filter((lead) => lead.agentId === user.id);
      return {
        id: user.id,
        name: user.name || user.email,
        role:
          user.role === "SUPER_ADMIN"
            ? "Admin"
            : user.role === "COMPANY_ADMIN"
              ? "Team Lead"
              : "Sales Agent",
        status: index % 2 === 0 ? "Online" : "Away",
        leadsAssigned: assigned.length,
        closedDeals: assigned.filter((lead) => lead.status === "SOLD").length,
        avgResponseMinutes: 15 - Math.min(index * 2, 8),
      };
    });
  } catch (error) {
    console.error("Falling back to seed team:", error);
    return seedTeamMembers;
  }
}

export async function getLeadConversation(leadId: string) {
  await ensureSeeded();
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "asc" } },
      property: true,
    },
  });

  if (!lead) {
    return null;
  }

  return {
    lead: {
      ...mapLead(lead),
      notesCount: lead.notes.length,
      messagesCount: lead.messages.length,
      assignedProperty: lead.property ? mapProperty(lead.property) : undefined,
    },
    messages: lead.messages.map((message: Message) => ({
      id: message.id,
      content: message.content,
      isIncoming: message.isIncoming,
      createdAt: message.createdAt.toISOString(),
    })) as ConversationMessage[],
    notes: lead.notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    })),
  };
}

export async function createLead(input: {
  name: string;
  phone: string;
  email?: string;
  status?: Lead["status"];
  score?: UiLead["score"];
  source?: string;
  budget?: number;
  preferredLocation?: string;
  propertyId?: string;
}) {
  const companyId = await getCompanyId();

  const created = await prisma.lead.create({
    data: {
      companyId,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      status: input.status || "NEW",
      score: input.score || "COLD",
      source: input.source || "CALL",
      budget: input.budget || null,
      preferredLocation: input.preferredLocation || null,
      propertyId: input.propertyId || null,
    },
  });

  return mapLead(created);
}

export async function updateLead(
  id: string,
  input: Partial<{
    name: string;
    phone: string;
    email: string;
    status: Lead["status"];
    score: UiLead["score"];
    source: string;
    budget: number;
    preferredLocation: string;
    propertyId: string | null;
    agentId: string | null;
  }>
) {
  const updated = await prisma.lead.update({
    where: { id },
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      status: input.status,
      score: input.score,
      source: input.source,
      budget: typeof input.budget === "number" ? input.budget : undefined,
      preferredLocation: input.preferredLocation,
      propertyId: input.propertyId,
      agentId: input.agentId,
    },
  });

  return mapLead(updated);
}

export async function createProperty(input: {
  name: string;
  location: string;
  type: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  status?: Property["status"];
}) {
  const companyId = await getCompanyId();

  const created = await prisma.property.create({
    data: {
      companyId,
      name: input.name,
      location: input.location,
      type: input.type,
      price: input.price,
      area: input.area,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      description: input.description || null,
      images: [],
      status: input.status || "AVAILABLE",
    },
  });

  return mapProperty(created);
}

export async function updateProperty(
  id: string,
  input: Partial<{
    name: string;
    location: string;
    type: string;
    price: number;
    area: number;
    bedrooms: number | null;
    bathrooms: number | null;
    description: string | null;
    status: Property["status"];
  }>
) {
  const updated = await prisma.property.update({
    where: { id },
    data: {
      name: input.name,
      location: input.location,
      type: input.type,
      price: typeof input.price === "number" ? input.price : undefined,
      area: typeof input.area === "number" ? input.area : undefined,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      description: input.description,
      status: input.status,
    },
  });

  return mapProperty(updated);
}

export async function appendMessage(
  leadId: string,
  input: { content: string; isIncoming: boolean }
) {
  const message = await prisma.message.create({
    data: {
      leadId,
      content: input.content,
      isIncoming: input.isIncoming,
    },
  });

  return {
    id: message.id,
    content: message.content,
    isIncoming: message.isIncoming,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function upsertWhatsAppLead(phone: string) {
  const companyId = await getCompanyId();
  const existing = await prisma.lead.findFirst({
    where: { phone, companyId },
  });

  if (existing) {
    return mapLead(existing);
  }

  const created = await prisma.lead.create({
    data: {
      companyId,
      phone,
      name: "WhatsApp Contact",
      status: "NEW",
      score: "COLD",
      source: "WHATSAPP",
      budget: 0,
      preferredLocation: "",
    },
  });

  return mapLead(created);
}

export async function getLeadSummary(leadId: string) {
  const conversation = await getLeadConversation(leadId);

  if (!conversation) {
    return null;
  }

  return {
    ...conversation,
    nextAction: getLeadNextAction(conversation.lead),
    matchSuggestions: [...(await listProperties())]
      .map((property) => ({
        property,
        fitScore: getPropertyFitScore(conversation.lead, property),
      }))
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 3),
    priceLabel: formatCurrency(conversation.lead.budget),
  };
}
