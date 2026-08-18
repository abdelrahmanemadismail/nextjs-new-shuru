import { getStrapiBaseUrl, extractMediaUrl } from "@/lib/strapi";
import { type Locale } from "@/lib/i18n";

export interface StrapiExpert {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  title: string;
  bio?: string;
  expertise?: string;
  certifications?: string;
  linkedin?: string;
  order?: number;
  featured?: boolean;
  avatarUrl?: string | null;
}

const fallbackExpertsAr: StrapiExpert[] = [
  {
    id: 1,
    name: "د. إبراهيم الفالح",
    slug: "dr-ibrahim-al-faleh",
    title: "قائد استشارات التحول ونماذج التشغيل",
    bio: "خبير تنفيذي يتمتع بأكثر من 18 عاماً في قيادة برامج التحول الاستراتيجي، وإعادة هيكلة مكاتب إدارة المشاريع (PMO)، وتصميم نماذج التشغيل المتطورة للجهات الحكومية والشركات الكبرى بالمملكة.",
    expertise: "الحوكمة ونماذج التشغيل, تأسيس وتطوير PMO, التخطيط الاستراتيجي, إدارة التغيير المؤسسي",
    certifications: "PfMP, PgMP, PMP, CMC, TOGAF 9.2",
    linkedin: "https://linkedin.com",
    order: 1,
    featured: true,
  },
  {
    id: 2,
    name: "م. سارة المهيدب",
    slug: "eng-sarah-al-muhaidib",
    title: "كبير خبراء إدارة المحافظ والبرامج الاستراتيجية",
    bio: "متخصصة في مواءمة محافظ المشاريع الاستثمارية مع مستهدفات رؤية 2030، وتصميم لوحات المتابعة والتحكم التنفيذية للقيادات وتحقيق كفاءة الإنفاق.",
    expertise: "إدارة المحافظ والبرامج (PPM), قياس النضج المؤسسي, لوحات التحكم الذكية, إدارة المخاطر",
    certifications: "PgMP, PfMP, PMI-RMP, MoP Practitioner",
    linkedin: "https://linkedin.com",
    order: 2,
    featured: true,
  },
  {
    id: 3,
    name: "أ. عبدالعزيز القحطاني",
    slug: "abdulaziz-al-qahtani",
    title: "مستشار أول في الذكاء الاصطناعي والتحول الرقمي",
    bio: "يقود مبادرات أتمتة العمليات الحكومية وهندسة البيانات التشغيلية وتطبيقات الذكاء الاصطناعي التوليدي لرفع كفاءة وسرعة اتخاذ القرار المؤسسي.",
    expertise: "الذكاء الاصطناعي المؤسسي, أتمتة العمليات (RPA), استراتيجيات البيانات, المنصات الرقمية",
    certifications: "CDMP (Data Management), AWS Certified Solutions Architect, ITIL 4",
    linkedin: "https://linkedin.com",
    order: 3,
    featured: true,
  },
  {
    id: 4,
    name: "د. خالد السبيعي",
    slug: "dr-khaled-al-subaie",
    title: "خبير إدارة المنافع والقيمة المؤسسية",
    bio: "أكثر من 15 عاماً في قياس العائد على الاستثمار للمبادرات الوطنية، وتقييم الجدوى الاقتصادية الشاملة وتحليل أثر السياسات والقرارات الاستراتيجية.",
    expertise: "إدارة المنافع والقيمة, دراسات الجدوى والأثر, الاقتصاد التنفيذي, مؤشرات الأداء (KPIs)",
    certifications: "Benefits Management Practitioner, PMI-PBA, CFA Charterholder",
    linkedin: "https://linkedin.com",
    order: 4,
    featured: false,
  },
  {
    id: 5,
    name: "أ. نورة الدوسري",
    slug: "noura-al-dossary",
    title: "مستشارة الحوكمة وإدارة المعرفة المؤسسية",
    bio: "متخصصة في بناء أطر نقل المعرفة المؤسسية، وهندسة السياسات واللوائح، وتأسيس مجتمعات الممارسة المهنية لتمكين فرق العمل الداخلية.",
    expertise: "إدارة المعرفة ونقل الخبرات, حوكمة اللوائح والسياسات, التمكين المؤسسي, تصميم النماذج التشغيلية",
    certifications: "CKP (Certified Knowledge Practitioner), CGEIT, Six Sigma Black Belt",
    linkedin: "https://linkedin.com",
    order: 5,
    featured: false,
  },
  {
    id: 6,
    name: "م. فهد العصيمي",
    slug: "fahad-al-osaimi",
    title: "خبير التميز المؤسسي وتقييم النضج",
    bio: "مستشار معتمد في تقييم وتطبيق معايير التميز المؤسسي الوطنية والدولية، وتطوير أطر الحوكمة الرشيقة وتسريع تسليم المخرجات.",
    expertise: "تقييم النضج المؤسسي, معايير التميز المؤسسي, إعادة هندسة العمليات, الحوكمة الرشيقة (Agile)",
    certifications: "EFQM Assessor, Lean Six Sigma Master Black Belt, PMP, PMI-ACP",
    linkedin: "https://linkedin.com",
    order: 6,
    featured: false,
  }
];

const fallbackExpertsEn: StrapiExpert[] = [
  {
    id: 1,
    name: "Dr. Ibrahim Al-Faleh",
    slug: "dr-ibrahim-al-faleh",
    title: "Transformation & Operating Models Lead Consultant",
    bio: "Executive advisor with 18+ years leading strategic transformations, PMO restructurings, and enterprise operating model designs across government entities and major corporations.",
    expertise: "Governance & Operating Models, PMO Setup & Maturity, Strategic Planning, Change Management",
    certifications: "PfMP, PgMP, PMP, CMC, TOGAF 9.2",
    linkedin: "https://linkedin.com",
    order: 1,
    featured: true,
  },
  {
    id: 2,
    name: "Eng. Sarah Al-Muhaidib",
    slug: "eng-sarah-al-muhaidib",
    title: "Senior Strategic Portfolio & Program Expert",
    bio: "Specialist in aligning strategic investment portfolios with Vision 2030 objectives, designing executive command dashboards, and spending efficiency.",
    expertise: "Portfolio & Program Management (PPM), Organizational Maturity, Executive Dashboards, Risk Management",
    certifications: "PgMP, PfMP, PMI-RMP, MoP Practitioner",
    linkedin: "https://linkedin.com",
    order: 2,
    featured: true,
  },
  {
    id: 3,
    name: "Abdulaziz Al-Qahtani",
    slug: "abdulaziz-al-qahtani",
    title: "Senior AI & Digital Transformation Advisor",
    bio: "Leading government workflow automation, operational data architectures, and generative AI integrations to accelerate executive decision-making.",
    expertise: "Enterprise AI, Workflow Automation (RPA), Data Strategy, Digital Platforms",
    certifications: "CDMP (Data Management), AWS Certified Solutions Architect, ITIL 4",
    linkedin: "https://linkedin.com",
    order: 3,
    featured: true,
  },
  {
    id: 4,
    name: "Dr. Khaled Al-Subaie",
    slug: "dr-khaled-al-subaie",
    title: "Enterprise Value & Benefits Realization Expert",
    bio: "15+ years evaluating ROI for national initiatives, conducting economic feasibility studies, and analyzing policy and regulatory impacts.",
    expertise: "Value & Benefits Management, Feasibility & Impact Studies, Executive Economics, Key Performance Indicators",
    certifications: "Benefits Management Practitioner, PMI-PBA, CFA Charterholder",
    linkedin: "https://linkedin.com",
    order: 4,
    featured: false,
  },
  {
    id: 5,
    name: "Noura Al-Dossary",
    slug: "noura-al-dossary",
    title: "Governance & Knowledge Management Consultant",
    bio: "Specialist in knowledge transfer architectures, regulatory policy engineering, and institutional communities of practice across complex organizations.",
    expertise: "Knowledge Management & Transfer, Policy & Regulatory Governance, Organizational Enablement, Operating Models",
    certifications: "CKP (Certified Knowledge Practitioner), CGEIT, Six Sigma Black Belt",
    linkedin: "https://linkedin.com",
    order: 5,
    featured: false,
  },
  {
    id: 6,
    name: "Eng. Fahad Al-Osaimi",
    slug: "fahad-al-osaimi",
    title: "Institutional Excellence & Maturity Assessment Expert",
    bio: "Certified advisor in assessing and applying national & international institutional excellence frameworks, agile governance, and accelerated delivery.",
    expertise: "Institutional Maturity Assessment, Business Process Re-engineering, Agile Governance, EFQM Framework",
    certifications: "EFQM Assessor, Lean Six Sigma Master Black Belt, PMP, PMI-ACP",
    linkedin: "https://linkedin.com",
    order: 6,
    featured: false,
  }
];

export async function getExperts(locale: Locale): Promise<StrapiExpert[]> {
  try {
    const strapiBase = getStrapiBaseUrl();
    const url = `${strapiBase}/api/experts?locale=${locale}&populate=*&sort=order:asc`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (process.env.STRAPI_FULL_ACCESS_API_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.STRAPI_FULL_ACCESS_API_TOKEN}`;
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`Failed to fetch experts from Strapi (${res.status}), returning fallback data.`);
      return locale === "ar" ? fallbackExpertsAr : fallbackExpertsEn;
    }

    const json = await res.json();
    const data = json.data;

    if (!Array.isArray(data) || data.length === 0) {
      return locale === "ar" ? fallbackExpertsAr : fallbackExpertsEn;
    }

    return data.map((item: any) => {
      const attrs = item.attributes || item;
      const avatarUrl = extractMediaUrl(attrs.avatar);

      return {
        id: item.id,
        documentId: item.documentId || String(item.id),
        name: attrs.name || "",
        slug: attrs.slug || "",
        title: attrs.title || "",
        bio: attrs.bio || "",
        expertise: attrs.expertise || "",
        certifications: attrs.certifications || "",
        linkedin: attrs.linkedin || "",
        order: attrs.order ?? 0,
        featured: Boolean(attrs.featured),
        avatarUrl,
      };
    });
  } catch (error) {
    console.error("Error in getExperts:", error);
    return locale === "ar" ? fallbackExpertsAr : fallbackExpertsEn;
  }
}
