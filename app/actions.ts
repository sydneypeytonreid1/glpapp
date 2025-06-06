// Real telehealth programs with affiliate links for monetization
export async function callAI(preferences: any) {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const programs = [
    {
      name: "Life.md GLP-1 Program",
      provider: "Life.md",
      monthlyPrice: 299,
      medication: "Semaglutide & Tirzepatide",
      description: "Comprehensive telehealth program with personalized weight management, nutrition coaching, and prescription GLP-1 medications delivered to your door.",
      support: "24/7 medical support and personalized coaching",
      insurance: "Insurance accepted, HSA/FSA eligible",
      visits: "Virtual consultations with licensed physicians",
      affiliateLink: "https://liferx.md/?utm_source=efc&u1=107&_ef_transaction_id=&oid=1&affid=107",
      featured: true
    },
    {
      name: "855 Semaglutide Direct",
      provider: "855 Semaglutide",
      monthlyPrice: 249,
      medication: "Semaglutide",
      description: "Direct access to Semaglutide with licensed physician consultation. Fast approval process and discreet home delivery.",
      support: "Licensed physician consultations and follow-ups",
      insurance: "Self-pay with flexible payment options",
      visits: "Telemedicine consultations",
      affiliateLink: "https://855semaglutide.com/?ref=Gettheglp",
      featured: true
    },
    {
      name: "iVisitDoc Weight Management",
      provider: "iVisitDoc",
      monthlyPrice: 199,
      medication: "Semaglutide & Tirzepatide",
      description: "Affordable telehealth weight management with board-certified physicians. Includes ongoing monitoring and lifestyle coaching.",
      support: "Board-certified physician support and progress tracking",
      insurance: "Most insurance plans accepted",
      visits: "Virtual appointments with follow-up care",
      affiliateLink: "https://ivisitdoc.com/?ref=STACYMARTIN",
      featured: true
    },
    {
      name: "TeleMedical Services GLP-1",
      provider: "TeleMedical Services",
      monthlyPrice: 179,
      medication: "Semaglutide",
      description: "Budget-friendly GLP-1 program with experienced medical professionals. Quick online consultations and home delivery.",
      support: "Medical consultations with certified providers",
      insurance: "Self-pay, HSA/FSA accepted",
      visits: "Online medical consultations",
      affiliateLink: "https://telemedicalservices.com/ref/Stacyglp1/",
      featured: false
    },
    {
      name: "ReflexMD Weight Loss",
      provider: "ReflexMD",
      monthlyPrice: 349,
      medication: "Tirzepatide & Semaglutide",
      description: "Premium telehealth weight loss program with advanced monitoring, nutrition plans, and comprehensive medical support.",
      support: "Comprehensive medical team and nutrition specialists",
      insurance: "Insurance billing available",
      visits: "Virtual consultations with specialist follow-ups",
      affiliateLink: "https://www.reflexmd.com/?_ef_transaction_id=185b8d120d6f4dda8a365ba24997bbaa#lp_v1",
      featured: true
    },
    {
      name: "HealthifyGLP Alternative",
      provider: "Generic Telehealth",
      monthlyPrice: 229,
      medication: "Semaglutide",
      description: "Alternative telehealth program for comparison purposes.",
      support: "Standard medical support",
      insurance: "Limited insurance acceptance",
      visits: "Basic virtual consultations",
      affiliateLink: undefined,
      featured: false
    }
  ];

  // Filter programs based on preferences, but always show affiliate partners first
  let filteredPrograms = programs.filter(program => {
    if (preferences.budgetRange) {
      const budget = preferences.budgetRange;
      const price = program.monthlyPrice;
      
      if (budget === "under $100/month" && price >= 100) return false;
      if (budget === "$100-$250/month" && (price < 100 || price > 250)) return false;
      if (budget === "$250-$500/month" && (price < 250 || price > 500)) return false;
      if (budget === "$500+" && price < 500) return false;
    }
    
    if (preferences.medication && preferences.medication !== "no preference") {
      if (!program.medication.toLowerCase().includes(preferences.medication.toLowerCase())) return false;
    }
    
    return true;
  });

  // Ensure featured affiliate partners are always included and prioritized
  const affiliatePrograms = programs.filter(p => p.affiliateLink && p.featured);
  const otherPrograms = filteredPrograms.filter(p => !p.featured);
  
  // Combine with affiliate programs first
  const finalPrograms = [...affiliatePrograms, ...otherPrograms].slice(0, 5);
  
  return finalPrograms.length > 0 ? finalPrograms : programs.slice(0, 3);
}