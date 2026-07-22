/**
 * All marketing copy for the landing page in one place, so non-devs can
 * tweak wording without touching component markup.
 */

export const BRAND = {
  name: "HyperNova AI",
  fullName: "HyperNova AI Readiness and Tools Assessment",
  mark: "HNA",
  tagline: "Ready Beats Reactive",
  price: 199,
  email: "hello@hypernova-ai.com",
} as const;

export const NAV_LINKS = [
  { href: "#pains", label: "The problem" },
  { href: "#how", label: "How it works" },
  { href: "#report", label: "What you get" },
  { href: "#guarantee", label: "Guarantee" },
] as const;

export const HERO_PILLS = [
  "Uncover your real pain points",
  "Find the right AI tools",
  "Delivered in days, not weeks",
] as const;

export const TRUST_METRICS = [
  { value: "$199", label: "flat — one simple fee" },
  { value: "Clarity", label: "on where AI fits your business" },
  { value: "Days", label: "to your roadmap, not weeks" },
] as const;

export const CLIENT_TYPES = ["Clinics", "Agencies", "Contractors", "Real Estate", "Gov Offices"] as const;

export const PAINS = [
  { n: "PAIN 01", title: "Repetitive busywork", body: "Manual tasks your team does over and over that AI could handle in seconds." },
  { n: "PAIN 02", title: "Scattered information", body: "Answers buried across inboxes, drives, and docs that nobody can find fast." },
  { n: "PAIN 03", title: "Slow follow-up", body: "Leads and customers waiting on replies while your team is heads-down." },
  { n: "PAIN 04", title: "Admin overload", body: "Email, scheduling, and paperwork eating the hours you should spend growing." },
  { n: "PAIN 05", title: "Content bottlenecks", body: "Marketing, proposals, and docs that stall because writing takes forever." },
  { n: "PAIN 06", title: "Tool overwhelm", body: "A thousand AI tools and no idea which ones are actually worth your money." },
] as const;

export const STEPS = [
  { n: "01", title: "Discovery session", body: "A focused 30–60 minute conversation. No pitching — we map your real day, tasks, and bottlenecks." },
  { n: "02", title: "AI-assisted analysis", body: "We turn that into structured insight: your pain points, time leaks, and the tools that fit your business." },
  { n: "03", title: "Your readiness report", body: "Your key pain points, the right AI tools to fix them, and a prioritized plan for where to start first." },
  { n: "04", title: "Walkthrough call", body: "We walk you through it, answer questions, and show what you can DIY vs. have us build." },
] as const;

export const REPORT_SLIDES = [
  { n: "01", title: "Executive Summary" },
  { n: "02", title: "Your Pain Points" },
  { n: "03", title: "Where Time Is Leaking" },
  { n: "04", title: "Effort vs Impact Matrix" },
  { n: "05", title: "Tool Recommendations" },
  { n: "06", title: "Quick-Win Plan" },
  { n: "07", title: "Estimated Hours Saved" },
  { n: "08", title: "Implementation Options" },
  { n: "09", title: "Your Next Step" },
] as const;

export const OFFER_BULLETS = [
  "We map where your week actually goes.",
  "We surface the pain points AI can solve.",
  "We recommend the exact tools to fix them.",
  "You get a clear report + walkthrough call.",
] as const;

export const ASSESSMENT_FEATURES = [
  "30–60 min discovery session",
  "Your key pain points uncovered",
  "Tailored AI tool recommendations",
  "Effort-vs-impact roadmap",
  "Estimated hours-saved projection",
  "Walkthrough & next-steps call",
] as const;

export const CUSTOM_FEATURES = [
  "Done-with-you or done-for-you",
  "Agents & workflow automation",
  "Data cleanup & knowledge systems",
  "Ongoing AI Concierge support",
] as const;

export const BOOK_CHECKLIST = [
  `Email: ${BRAND.email}`,
  "Discovery session: 30–60 minutes",
  "Report + walkthrough included",
  "5 hrs/week saved — or full refund",
] as const;

export const PRIORITY_OPTIONS = [
  "Save 5+ hours per week",
  "Find the right AI tools",
  "Automate repetitive tasks",
  "Clean up scattered data",
  "Speed up customer follow-up",
] as const;
