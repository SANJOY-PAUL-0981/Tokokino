import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BrandLogo } from "@/components/editor/brand-logo"

import { TermsIndex } from "./terms-index"

export const metadata: Metadata = {
  title: "Terms & Conditions — Noctivy",
  description:
    "Review the terms and conditions governing access to and use of Noctivy.",
}

const EFFECTIVE_DATE = "May 17, 2026"

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "These Terms and Conditions govern your access to and use of Noctivy, including the website, editor, authentication features, sharing tools, export functionality, and any related services made available by Noctivy (collectively, the Service). By accessing or using the Service, creating an account, signing in through a third-party provider, uploading content, or otherwise interacting with the Service, you agree to be bound by these Terms.",
      "If you use the Service on behalf of a company, organization, or other legal entity, you represent that you have authority to bind that entity to these Terms. If you do not agree to these Terms, you must not access or use the Service.",
    ],
  },
  {
    title: "2. Eligibility and Accounts",
    body: [
      "You must be at least 13 years old, or the minimum age required in your jurisdiction, to use the Service. You are responsible for ensuring that your use of the Service is lawful in the jurisdiction from which you access it.",
      "When you sign in using Google or another supported authentication provider, you authorize Noctivy to receive and process the account information made available by that provider for authentication and account management. You are responsible for maintaining the confidentiality and security of your account credentials and for all activity occurring under your account.",
    ],
  },
  {
    title: "3. Description of the Service",
    body: [
      "Noctivy provides tools for creating, styling, framing, exporting, saving, and sharing screenshot-based visuals. Features may include device mockups, browser frames, backgrounds, effects, image uploads, export tools, and public or private sharing workflows.",
      "The Service may evolve over time. Noctivy may add, modify, suspend, or discontinue any feature, integration, or availability of the Service at any time, with or without notice, subject to applicable law.",
    ],
  },
  {
    title: "4. User Content and License",
    body: [
      "You retain ownership of screenshots, images, text, metadata, designs, and other materials that you upload, create, submit, store, or share through the Service (User Content). You are solely responsible for your User Content and for obtaining all rights, permissions, licenses, consents, and clearances necessary to use it with the Service.",
      "By using the Service, you grant Noctivy a limited, worldwide, non-exclusive, royalty-free license to host, store, reproduce, process, display, transmit, and otherwise use your User Content solely as necessary to operate, maintain, secure, improve, and provide the Service to you and to others with whom you choose to share content.",
      "You represent and warrant that your User Content does not infringe, misappropriate, or violate any intellectual property, privacy, publicity, contractual, confidentiality, or other rights of any third party, and does not violate applicable law.",
    ],
  },
  {
    title: "5. Acceptable Use",
    body: [
      "You agree not to misuse the Service or assist anyone else in doing so. Prohibited conduct includes attempting to gain unauthorized access to the Service or related systems, interfering with Service availability or security, introducing malware or harmful code, reverse engineering restricted components, scraping or harvesting data without authorization, or using the Service to violate applicable law.",
      "You must not upload, create, publish, or share content that is unlawful, defamatory, fraudulent, deceptive, abusive, harassing, hateful, sexually exploitative, invasive of privacy, infringing, or otherwise harmful. Noctivy may remove or restrict access to content or accounts where it reasonably believes these Terms have been violated.",
    ],
  },
  {
    title: "6. Intellectual Property",
    body: [
      "Except for your User Content, the Service and all associated software, interfaces, designs, graphics, trademarks, logos, text, workflows, documentation, and other materials are owned by Noctivy or its licensors and are protected by intellectual property and other laws.",
      "These Terms do not transfer any ownership rights to you. Subject to your compliance with these Terms, Noctivy grants you a limited, revocable, non-exclusive, non-transferable license to access and use the Service for its intended purpose.",
    ],
  },
  {
    title: "7. Third-Party Services",
    body: [
      "The Service may rely on or link to third-party services, including authentication providers, hosting providers, storage services, analytics tools, image sources, and payment or export integrations. Your use of third-party services may be governed by separate terms and privacy policies of those third parties.",
      "Noctivy is not responsible for third-party services, third-party content, or the acts or omissions of third-party providers. Access to third-party services may change or become unavailable without notice.",
    ],
  },
  {
    title: "8. Privacy and Data Protection",
    body: [
      "Noctivy processes personal information in connection with authentication, account management, Service operation, security, support, and product improvement. Your use of the Service is also subject to any privacy policy or privacy notice made available by Noctivy.",
      "You are responsible for ensuring that any personal information included in User Content has been collected and shared lawfully and with all required notices and consents.",
    ],
  },
  {
    title: "9. Paid Features and Changes",
    body: [
      "Certain features may be offered for free, as a beta, or as paid functionality. If paid features are introduced, applicable prices, billing terms, renewal terms, taxes, cancellation rights, and refund rules will be disclosed at or before purchase.",
      "Noctivy may change feature availability, usage limits, storage limits, export limits, or pricing for future use of the Service, subject to applicable law and any terms presented at the time of purchase.",
    ],
  },
  {
    title: "10. Disclaimers",
    body: [
      "The Service is provided on an as is and as available basis. To the maximum extent permitted by applicable law, Noctivy disclaims all warranties, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, accuracy, and reliability.",
      "Noctivy does not warrant that the Service will be uninterrupted, secure, error-free, free from harmful components, or that any content will be preserved without loss. You are responsible for maintaining independent backups of important User Content.",
    ],
  },
  {
    title: "11. Limitation of Liability",
    body: [
      "To the maximum extent permitted by applicable law, Noctivy and its owners, developers, affiliates, licensors, service providers, and agents will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, goodwill, data, content, business opportunity, or business interruption, arising out of or relating to the Service or these Terms.",
      "To the maximum extent permitted by applicable law, Noctivy's aggregate liability for all claims arising out of or relating to the Service or these Terms will not exceed the greater of the amount you paid to Noctivy for the Service in the three months preceding the event giving rise to the claim or one hundred United States dollars (US $100).",
    ],
  },
  {
    title: "12. Indemnification",
    body: [
      "You agree to defend, indemnify, and hold harmless Noctivy and its owners, developers, affiliates, licensors, service providers, and agents from and against any claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys' fees, arising out of or relating to your User Content, your use or misuse of the Service, your violation of these Terms, your violation of law, or your violation of any third-party rights.",
    ],
  },
  {
    title: "13. Suspension and Termination",
    body: [
      "Noctivy may suspend or terminate your access to the Service, remove content, or disable features at any time if it reasonably believes that you have violated these Terms, created legal risk, caused harm to the Service or others, or used the Service in a manner inconsistent with its intended purpose.",
      "You may stop using the Service at any time. Provisions that by their nature should survive termination will survive, including provisions concerning ownership, licenses necessary for completed sharing or exports, disclaimers, limitations of liability, indemnification, dispute terms, and general legal terms.",
    ],
  },
  {
    title: "14. Changes to These Terms",
    body: [
      "Noctivy may update these Terms from time to time. Updated Terms will be posted with a revised effective date. Your continued use of the Service after updated Terms become effective constitutes acceptance of the updated Terms, except where applicable law requires a different form of notice or consent.",
    ],
  },
  {
    title: "15. Governing Law and Disputes",
    body: [
      "Unless a separate written agreement states otherwise, these Terms are governed by the laws applicable in the jurisdiction where the operator of Noctivy is principally located, without regard to conflict-of-law rules. You and Noctivy agree to seek to resolve disputes informally before initiating formal proceedings.",
      "Nothing in these Terms limits rights that cannot be waived under applicable consumer protection, data protection, or other mandatory laws.",
    ],
  },
  {
    title: "16. Contact",
    body: [
      "Questions, notices, issue reports, support requests, account concerns, or requests concerning these Terms should be directed to the Noctivy operator through the contact methods made available on the Service, in the account or support materials, or in the project materials associated with Noctivy.",
      "You may also contact Noctivy for issues or support through GitHub at https://github.com/shivabhattacharjee, by email where an official email address is published in the project materials, or on X at https://x.com/sh17va.",
    ],
  },
]

const indexItems = sections.map((section) => ({
  id: slugify(section.title),
  label: section.title.replace(/^\d+\.\s/, ""),
}))

export default function TermsPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="border-b border-border/70 bg-card/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-7 sm:px-10 lg:px-12">
          <nav className="flex items-center justify-between gap-5">
            <BrandLogo />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Back to sign in
            </Link>
          </nav>

          <div className="min-w-0 space-y-4 text-left">
            <h1 className="max-w-full text-[clamp(1.75rem,5.2vw,5.05rem)] leading-[0.95] font-semibold tracking-[-0.04em] whitespace-nowrap">
              Terms &amp; Conditions
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              These terms define the rules for accessing, using, saving,
              exporting, and sharing work through Noctivy.
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              Effective date:{" "}
              <strong className="font-semibold text-foreground">
                {EFFECTIVE_DATE}
              </strong>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[240px_1fr] lg:px-12 lg:py-14">
        <aside className="hidden lg:block">
          <TermsIndex items={indexItems} />
        </aside>

        <article className="min-w-0 space-y-9">
          <div className="border-l-2 border-primary/60 pl-5 text-sm leading-7 text-muted-foreground">
            <p>
              Please read these Terms carefully. They contain important
              provisions affecting your legal rights, including disclaimers,
              limits of liability, and obligations relating to content that you
              upload or share.
            </p>
          </div>

          {sections.map((section) => (
            <section
              key={section.title}
              id={slugify(section.title)}
              className="scroll-mt-8 border-t border-border/70 pt-8"
            >
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </section>
    </main>
  )
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
