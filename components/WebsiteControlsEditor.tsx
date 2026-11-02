"use client";

import { useMemo, useState } from "react";
import { AdminImageUpload } from "@/components/AdminMedia";
import fields from "@/lib/site-editable.json";
import type { SiteContent } from "@/lib/site-content";

const isImageField = (value: string) => /\.(?:jpe?g|png|webp|avif|gif|tiff?|heic|heif)(?:[?#].*)?$/i.test(value);

export function WebsiteControlsEditor({ content, onChange }: { content: SiteContent; onChange: (value: SiteContent) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(fields.find((field) => field.kind === "text")?.id || "");
  const [page, setPage] = useState("app/page.tsx");
  const filtered = useMemo(
    () => fields.filter((field) => field.kind !== "section" && !("retired" in field && field.retired) && (field.label + " " + field.page + " " + field.source).toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const field = filtered.find((item) => item.id === selected) || filtered[0];
  const controls = content.controls || { texts: {}, assets: {}, sections: {}, order: {} };
  const group = field?.kind === "text" ? "texts" : "assets";
  const value = field ? controls[group][field.id] ?? field.defaultValue : "";

  function setValue(next: string, reset = false) {
    if (!field) return;
    const changes = { ...controls[group] };
    if (reset) delete changes[field.id];
    else changes[field.id] = next;
    onChange({ ...content, controls: { ...controls, [group]: changes } });
  }

  const sections = fields.filter((item) => item.kind === "section" && item.source === page);
  const saved = controls.order[page] || sections.map((section) => section.id);
  const ordered = [...sections].sort((a, b) => {
    const first = saved.indexOf(a.id);
    const second = saved.indexOf(b.id);
    return (first < 0 ? 9999 : first) - (second < 0 ? 9999 : second);
  });
  const pages = [...new Set(fields.filter((item) => item.kind === "section").map((item) => item.source))];

  function move(id: string, delta: number) {
    const ids = ordered.map((section) => section.id);
    const index = ids.indexOf(id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onChange({ ...content, controls: { ...controls, order: { ...controls.order, [page]: ids } } });
  }

  return (
    <div style={{ borderTop: "1px solid #d8e0d9", paddingTop: 28, marginTop: 28 }}>
      <span className="atelier-kicker">THE WHOLE WEBSITE</span>
      <h2>Words, links and imagery.</h2>
      <p>Edit the public copy, navigation links, images and films across the homepage, collections, customizer, header, footer and introduction. For the homepage story, search “Our Story” to edit its image, caption and copy. Product names, prices and stock remain in Products. Save everything with Publish changes.</p>
      <label>Find website content<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search text, image paths or page names" /></label>
      <label>Website field<select value={field?.id || ""} onChange={(event) => setSelected(event.target.value)}>{filtered.map((item) => <option key={item.id} value={item.id}>{item.page} / {item.label.slice(0, 100)}</option>)}</select></label>
      {field && <>
        <small>{field.page} · {field.kind === "text" ? "Website text" : "Website address / media URL"}</small>
        <label>Field value{field.kind === "text"
          ? <textarea aria-label="Field value" rows={5} maxLength={5000} value={value} onChange={(event) => setValue(event.target.value)} />
          : <input aria-label="Field value" maxLength={2000} value={value} onChange={(event) => setValue(event.target.value)} />}</label>
        {field.kind === "asset" && isImageField(field.defaultValue) && <>
          {value && <div role="img" aria-label={`Current image for ${field.label}`} style={{ width: "min(100%, 480px)", height: 280, margin: "12px 0", backgroundImage: `url("${value}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "left center", backgroundColor: "#f4f5f2" }} />}
          <AdminImageUpload label="Choose a replacement image" onUploaded={(url) => setValue(url)} />
          <small>Your upload is optimized to WebP and added to the public media library. Publish changes to update the website.</small>
        </>}
        <button type="button" className="atelier-text-button" onClick={() => setValue("", true)}>Restore original value</button>
        <p>Original: <span style={{ overflowWrap: "anywhere" }}>{field.defaultValue}</span></p>
      </>}
      <h2>Sections, in your order.</h2>
      <label>Page or shared component<select value={page} onChange={(event) => setPage(event.target.value)}>{pages.map((item) => <option key={item} value={item}>{fields.find((candidate) => candidate.source === item)?.page || item}</option>)}</select></label>
      {ordered.map((section, index) => <div key={section.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #d8e0d9" }}>
        <label style={{ flex: 1, display: "flex", gap: 12, alignItems: "center", margin: 0 }}><input type="checkbox" style={{ width: 18 }} checked={controls.sections[section.id] !== false} onChange={(event) => onChange({ ...content, controls: { ...controls, sections: { ...controls.sections, [section.id]: event.target.checked } } })} />{section.label.replaceAll("-", " ")}</label>
        <button type="button" aria-label={`Move ${section.label} up`} disabled={index === 0} onClick={() => move(section.id, -1)}>↑</button>
        <button type="button" aria-label={`Move ${section.label} down`} disabled={index === ordered.length - 1} onClick={() => move(section.id, 1)}>↓</button>
      </div>)}
      <small>Ordering applies to top-level sections on each page. Security, payments, business records and arbitrary page layout are intentionally managed separately.</small>
    </div>
  );
}
