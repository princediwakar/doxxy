---
slug: patient-data-security-checklist
title: "Patient Data Security: A Comprehensive Checklist for Clinics"
author: "Amit Patel"
publishDate: "2024-01-05"
readTime: "10 min read"
category: "Compliance"
heroImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop"
---

> **Healthcare data breaches cost an average of $10.93 million per incident in 2023 — more than any other industry.** Protecting patient information is not just a regulatory requirement; it is a core pillar of patient trust. Use this 20-point checklist to benchmark your practice and close the gaps before they become headlines.

## Introduction: The Stakes Have Never Been Higher

Healthcare is the most targeted industry for cyberattacks. Patient records sell for $250+ on dark-web markets (compared to $5 for a credit card number) because they contain immutable personal data — names, dates of birth, insurance IDs, and medical histories that cannot be reissued like a credit card.

India's Digital Personal Data Protection (DPDP) Act 2023 raised the compliance bar significantly, with penalties reaching ₹250 crore for certain violations. Whether your clinic operates in India, serves international patients, or plans to expand, security posture is now a business differentiator. Patients ask about it. Insurers audit for it. And regulators enforce it.

This checklist covers the 20 controls every clinic should have in place, organized into five domains: Access, Encryption, Network, Training, and Incident Response.

![Security checklist on clipboard](https://images.unsplash.com/photo-1508385082359-f35b39e4b2fb?w=1000&fit=crop)

---

## Domain 1: Access Controls (Points 1–5)

**1. Enforce Multi-Factor Authentication (MFA) for every account.** SMS-based MFA is better than nothing; authenticator apps (TOTP) and hardware security keys are better still. MFA blocks over 99% of automated credential-stuffing attacks.

**2. Implement Role-Based Access Control (RBAC).** A front-desk coordinator does not need access to clinical notes. A billing clerk does not need access to lab results. Define at least four roles (Admin, Clinician, Front Desk, Billing) with minimum-necessary permissions. Audit role assignments quarterly.

**3. Maintain unique accounts per staff member.** Never share login credentials. If Dr. Sharma logs in from two IPs in different cities within 10 minutes, your system should flag it.

**4. Enforce password complexity and rotation.** Minimum 12 characters, mixed case, numbers, and symbols. Rotate every 90 days. Doxxy's built-in password policy engine enforces these automatically.

**5. Auto-logout after 15 minutes of inactivity.** A clinician who steps away from a workstation in a busy corridor should not leave an open session. This is the single most common physical-security violation we observe during audits.

---

## Domain 2: Encryption & Data Protection (Points 6–10)

**6. Encrypt data at rest with AES-256.** All patient records, billing data, and attachments stored in your EHR, practice management system, or cloud storage must be encrypted. Doxxy encrypts at the database, file, and backup levels.

**7. Encrypt data in transit with TLS 1.3.** Any data moving between a browser and your server, or between your server and third-party APIs (payment gateways, lab integrations), must use TLS 1.3. Downgrade attacks on older TLS versions remain a common attack vector.

**8. Never store PHI in email, spreadsheets, or local downloads.** Email is not encrypted at rest by default. Excel files on a reception laptop are a breach waiting to happen. Centralize all PHI in your practice management system and enforce a policy: no PHI leaves the platform.

**9. Use field-level encryption for highly sensitive data.** Aadhaar numbers, HIV status, psychiatric notes, and genetic data warrant an additional encryption layer beyond database-level encryption. If the database is compromised, these fields remain ciphertext.

**10. Maintain encrypted, off-site backups tested monthly.** Ransomware gangs specifically target healthcare backups. Keep at least one air-gapped backup (not reachable from the production network) and run a restore drill every 30 days. If you've never tested a restore, you don't have a backup — you have a hope.

---

## Domain 3: Network & Device Security (Points 11–14)

**11. Segment your network.** Patient data systems should live on a VLAN separate from guest Wi-Fi, smart TVs, and IoT devices. Network segmentation limits lateral movement if an attacker compromises the reception tablet.

**12. Use a VPN for remote access. Never expose RDP or database ports to the public internet.** Clinicians accessing records from home must connect through an encrypted VPN tunnel. Doxxy's cloud platform eliminates this concern entirely — all access is via HTTPS with no open inbound ports on clinic hardware.

**13. Harden all endpoints.** Clinic workstations, laptops, and tablets should run up-to-date operating systems with endpoint protection (EDR) installed. Disable USB auto-run. Encrypt hard drives.

**14. Secure physical access to servers and workstations.** Server rooms should be locked with access logs. Workstations in semi-public areas (reception, nursing stations) should have privacy screens and auto-lock policies.

---

## Domain 4: Staff Training & Policies (Points 15–17)

**15. Conduct security awareness training at onboarding and annually.** Phishing simulations work. One clinic we worked with saw click rates drop from 34% to 4% after three rounds of simulated phishing campaigns with 10-minute debriefs.

**16. Maintain and enforce an Acceptable Use Policy (AUP).** The AUP should explicitly prohibit: sharing credentials, accessing PHI from personal devices without VPN, installing unapproved software, and connecting clinic systems to public Wi-Fi.

**17. Designate a Security Officer (even part-time).** This person owns the incident response plan, conducts quarterly access reviews, and stays current on regulatory changes (DPDP Act updates, MeitY advisories, CERT-In alerts).

---

## Domain 5: Incident Response & Vendor Management (Points 18–20)

**18. Have a written Incident Response Plan (IRP).** It should answer: Who declares an incident? Who gets called (and in what order)? How do you isolate affected systems? When do you notify patients and regulators? CERT-In mandates breach notification within 6 hours for certain categories.

**19. Vet your vendors.** Every third-party that touches patient data — billing service, lab interface, cloud host, SMS gateway — must provide a security assessment and sign a Data Processing Agreement (DPA). Doxxy provides these as part of standard onboarding.

**20. Conduct an annual penetration test and vulnerability scan.** Use an independent firm. Fix critical and high findings before the retest. Share the executive summary with your insurance carrier — it may reduce your cyber-liability premium.

---

## Conclusion & Next Steps

This checklist can feel overwhelming, but security is a journey. Start with the highest-impact, lowest-effort items: enable MFA everywhere (point #1), enforce auto-logout (point #5), and stop storing PHI in spreadsheets (point #8). Those three actions alone will meaningfully reduce your risk surface.

Doxxy's platform was built with security as a first principle — end-to-end encryption, RBAC, audit trails, and clinic-level data isolation are included in every plan. We also maintain SOC 2 Type II certification and provide DPAs to all customers at no additional cost.

Want to benchmark your clinic's security posture? [Contact us](/contact) for a complimentary 30-minute security assessment with our compliance team.
