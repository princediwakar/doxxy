# Doxxy — The Intelligent Clinic Management Platform

**Modern practice management for India's outpatient clinics. Less admin, more patients.**

---

## What Is Doxxy?

Doxxy is a cloud-based clinic management platform purpose-built for small to medium outpatient clinics in India. It replaces paper records, manual scheduling, and fragmented billing with one unified system — combining appointments, digital patient records, AI-powered clinical notes, pharmacy inventory, billing, and analytics in a single, intuitive interface.

**In one sentence:** Doxxy saves clinics 3+ hours of admin per day so doctors can focus on patients, not paperwork.

---

## The Problem Doxxy Solves

| Pain Point | The Doxxy Fix |
|---|---|
| **Scheduling chaos** — double bookings, no-shows, frustrated patients | Smart scheduling with automated SMS/WhatsApp reminders and real-time conflict detection. Reduce no-shows by 40%. |
| **Lost information** — physical files, incomplete patient history | Centralized, searchable digital records. Complete patient timeline at your fingertips. |
| **Billing errors** — manual invoicing, messy payment tracking | Automated invoice generation, payment tracking, and Razorpay online collection. |
| **Administrative drain** — hours lost on paperwork every day | Streamlined workflows that cut admin time by 3+ hours daily. |
| **Fragmented tools** — separate systems for records, billing, scheduling | One platform. Everything connected. No data silos. |

---

## Core Platform

### 1. Smart Appointment Management
- **AI-powered scheduling optimization** — intelligent slot suggestions based on doctor availability, appointment type, and historical duration patterns
- **Automated reminders** — SMS and WhatsApp reminders to patients, reducing no-shows by up to 40%
- **Online patient booking** — patients self-schedule via a booking portal with real-time availability sync
- **Waitlist management** — automatically fill cancelled slots from the waitlist
- **Multi-doctor calendar** — unified calendar view across all doctors with conflict detection
- **Recurring appointments** — set up follow-up series in one click

### 2. Comprehensive Patient Records (EMR)
- **360° patient profiles** — demographics, medical history, prescriptions, lab results, treatment plans, all in one place
- **Medical history timeline** — chronologically organized, fully searchable
- **Prescription management** — digital prescriptions with medicine auto-complete, dosage suggestions, and interaction checks
- **Family health connections** — link family members for holistic care
- **One-click PDF export** — shareable, print-ready patient summaries
- **Advanced search** — find any patient by name, phone, condition, or visit date in seconds

### 3. AI-Powered Consultation Notes
- **Voice-to-text clinical notes** — capture structured consultation notes using Sarvam AI speech recognition
- **Automatic formatting** — dictated notes are automatically structured into SOAP format (Subjective, Objective, Assessment, Plan)
- **Specialty-specific templates** — 11+ templates tailored for neurology, ophthalmology, and other specialties
- **Multi-language support** — dictation in English, Hindi, Tamil, and 12+ other languages
- **Searchable archives** — every note is indexed and retrievable

### 4. Integrated Billing & Payments
- **Automated invoice generation** — professional, print-ready invoices generated from consultation data
- **Payment tracking** — track paid, pending, and overdue payments with visual status indicators
- **Razorpay integration** — accept online payments via UPI, credit/debit cards, net banking, and digital wallets
- **Financial reporting** — revenue dashboards, collection reports, and tax-ready summaries
- **Multi-currency support** — handle payments in INR and other currencies
- **Insurance claim management** — track claims, approvals, and reimbursements

### 5. Pharmacy & AI Inventory Management
- **Medicine auto-complete** — search 31+ medicines by name, manufacturer, or composition with real-time results
- **Rich drug information** — pricing (₹), manufacturer, pack details (strips, bottles, vials), active compositions
- **AI-based stock management** — intelligent procurement extraction predicts reorder needs and identifies low-stock items
- **Multi-provider AI fallback** — uses Gemini for procurement extraction with automatic OpenAI fallback
- **Inventory tracking** — real-time stock levels, expiry alerts, and usage analytics

### 6. Practice Analytics & Dashboards
- **Role-specific dashboards** — superadmin, doctor, and staff each see the metrics that matter to them
- **Real-time KPIs** — appointments today, revenue, patient flow, collection rate
- **Revenue trend charts** — visualize income patterns across days, weeks, and months
- **Patient flow analysis** — understand peak hours, wait times, and visit patterns
- **Staff performance metrics** — track consultations per doctor, collection rates, patient satisfaction

### 7. Multi-Clinic Management
- **Centralized dashboard** — manage multiple clinic locations from one login
- **Location-specific reporting** — drill down into individual clinic performance
- **Cross-location scheduling** — book appointments across locations
- **Unified billing** — consolidated financial view across all clinics
- **Role-based access** — staff see only their assigned clinic(s)

---

## Pricing: Transparent & Fair

**No monthly subscriptions. No per-doctor fees. No hidden charges. No long-term contracts.**

| | Practice Essentials | Clinical Excellence |
|---|---|---|
| **Price** | Free | INR 10 / consultation |
| **Appointments** | First 100 free (lifetime) | Unlimited |
| **Doctors & Staff** | Unlimited | Unlimited |
| **Patient Records** | Essential | Comprehensive + digital prescriptions |
| **Reminders** | — | SMS & WhatsApp |
| **Analytics** | Basic reports | Clinical analytics & insights |
| **Support** | Standard | Priority 24/7 |

**Why per-appointment pricing?** You pay only when you see patients. Slow months cost less. Busy months scale naturally. No wasted spend on unused seats.

### How Doxxy Compares

| | Doxxy | Traditional Platforms |
|---|---|---|
| **Pricing model** | Per appointment (INR 10) | Monthly subscription + per-doctor fees |
| **Free tier** | First 100 consultations free | 14-30 day time-limited trial |
| **Doctor limits** | Unlimited on all plans | Pay per doctor/provider |
| **Contract** | No commitment, cancel anytime | Annual contracts with penalties |
| **Hidden fees** | None, all features included | Setup, training, support fees |

---

## Benefits at a Glance

### Save Time
Automated scheduling, reminders, billing, and AI notes save clinics **3+ hours of admin work every day**.

### Reduce Costs
Pay-per-appointment model with **unlimited doctors and staff**. No per-seat licensing. Clinics switching to Doxxy report **30-40% cost reduction** vs. traditional platforms.

### Improve Patient Experience
Online booking, shorter wait times, automated reminders, and fast digital check-in create a **smoother patient journey** from arrival to follow-up.

### Scale Without Limits
Add doctors, locations, and patients **without changing your plan or paying more per user**. Pricing scales with patient volume, not team size.

### Bank-Level Security
Encryption at rest and in transit via AES-256 and TLS. Role-based access control. Row-level security isolating each clinic's data. Automated daily backups with point-in-time recovery. Built on Supabase, a SOC 2 and GDPR-compliant cloud platform.

### Always Available
**99.9% uptime.** Hosted on Supabase cloud infrastructure with geographic redundancy. Technical support via email.

---

## Who Is Doxxy For?

Doxxy is designed for **small to medium outpatient clinics** (1-10 doctors) across specialties:

Cardiology · Neurology · Ophthalmology · Dermatology · Orthopedics · Dental · Pulmonology · ENT

With deep specialty support for **Neurology** and **Ophthalmology**, including structured templates, specialty-specific clinical data schemas, and tailored workflows.

---

## Technical Excellence

### Server-First Architecture
Built on **Next.js App Router** with server components by default. Data is fetched securely on the server — no client-side waterfalls, no exposed database queries. Client-side interactivity is reserved exclusively for interactive UI elements.

### AI That Works for You
- **Voice notes** — Sarvam AI speech-to-text for clinical dictation
- **Procurement intelligence** — Gemini + OpenAI fallback for stock management
- **Medicine search** — intelligent auto-complete with fuzzy matching

### Progressive Web App
Full PWA support with manifest, service worker, and app icons. Install Doxxy on any device — desktop, tablet, or phone — for a native app experience without an app store.

### Open Standards
- **HL7 FHIR** support for healthcare data interoperability
- **API-first** — custom integrations with lab systems, imaging centers, pharmacies
- **CSV import/export** — seamless data migration from legacy systems

### Integrations
- **Payments:** Razorpay (UPI, cards, net banking, wallets)
- **Communication:** SMS and WhatsApp reminders
- **Auth:** Google OAuth via Supabase
- **Accounting:** QuickBooks, Xero, FreshBooks compatible
- **Lab/Imaging:** LabCorp, Quest Diagnostics integration ready

---

## Security & Compliance

| Standard | Status |
|---|---|
| India DPDP Act 2023 | Compliant |
| Supabase (infrastructure) | SOC 2 & GDPR compliant |

**Security features:**
- AES-256 encryption at rest and in transit
- TLS encryption for all data transmission
- Role-based access control (RBAC)
- Row-level security isolating each clinic's data
- Audit logging via database-level trails
- Automated daily backups with point-in-time recovery

---

## Getting Started

1. **Sign up** — Create your free Practice Essentials account in under 5 minutes. No credit card required.
2. **Set up your clinic** — Add doctors, departments, and staff.
3. **Import data** — Migrate existing patient records via CSV import (free assisted migration available).
4. **Start practicing** — Book appointments, record consultations, and generate bills. Most clinics are fully operational within 15 minutes.

**Support every step of the way:** Live training sessions, video tutorials, comprehensive documentation, and 24/7 technical support.

---

## Contact

- **Website:** doxxy.app
- **Email:** doxxyapp@gmail.com
- **Phone:** +91 7388890554
- **Address:** Mumbai, India

**Ready to transform your practice?** Start with 100 free appointments. No setup fees. No commitment. Cancel anytime.

---

*Doxxy — Clinic work, made simple.*
