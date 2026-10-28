import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./LegalPage.module.css";

type LegalSection = {
  title: string;
  content: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <div className={styles.shell}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{title}</span>
          </nav>

          <header className={styles.header}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1>{title}</h1>
            <p className={styles.intro}>{intro}</p>
            <p className={styles.updated}>Last updated: {updated}</p>
          </header>

          <div className={styles.content}>
            {sections.map((section, index) => (
              <section className={styles.section} key={section.title}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.title}</h2>
                  <div className={styles.copy}>{section.content}</div>
                </div>
              </section>
            ))}
          </div>

          <aside className={styles.contact}>
            <p className={styles.eyebrow}>Questions or requests</p>
            <p>
              Contact the Dioka team at <a href="mailto:contactus@diokacraft.com">contactus@diokacraft.com</a>.
            </p>
            <div className={styles.related}>
              <Link href="/privacy">Privacy policy</Link>
              <Link href="/terms">Terms of service</Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
