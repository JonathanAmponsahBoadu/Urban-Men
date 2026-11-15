/**
 * Branded email templates (navy and gold, like the shop). Pure functions: data in, { subject, html } out.
 * Kept free of any Medusa imports so they are easy to test and to preview.
 */
type Data = Record<string, unknown>;

export const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const money = (amount: unknown, currency = "GHS") => {
  const n = Number(amount);
  if (Number.isNaN(n)) return "";
  const prefix = currency.toUpperCase() === "GHS" ? "GH₵ " : `${currency.toUpperCase()} `;
  return `${prefix}${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function layout(opts: { preheader: string; title: string; body: string; cta?: { label: string; url: string } }) {
  const cta = opts.cta
    ? `<p style="margin:28px 0 0"><a href="${escapeHtml(opts.cta.url)}" style="background:#e8b83a;color:#1b2231;text-decoration:none;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-size:13px;padding:14px 28px;border-radius:999px;display:inline-block">${escapeHtml(opts.cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#131925;font-family:Arial,Helvetica,sans-serif;color:#f5f1e8">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#131925"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1b2231;border-radius:16px;overflow:hidden">
<tr><td style="padding:28px 32px;border-bottom:2px solid #e8b83a"><span style="font-family:Georgia,serif;font-size:22px;letter-spacing:4px;color:#e8b83a">URBAN MEN</span><br><span style="font-size:11px;letter-spacing:3px;color:#aab2c3">PROFESSIONAL. TIMELESS. AUTHENTIC.</span></td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:26px;line-height:1.25;color:#f5f1e8">${escapeHtml(opts.title)}</h1>
<div style="font-size:15px;line-height:1.65;color:#d6dbe6">${opts.body}</div>${cta}</td></tr>
<tr><td style="padding:20px 32px;background:#131925;font-size:12px;color:#aab2c3">Urban Men Apparel &middot; Accra &amp; Kumasi, Ghana<br>You are receiving this because of your notification settings. You can change them in your account.</td></tr>
</table></td></tr></table></body></html>`;
}

type Item = { title?: string; variant_title?: string; size?: string; quantity?: number; qty?: number };

const itemsList = (items: unknown) =>
  Array.isArray(items) && items.length
    ? `<ul style="padding-left:18px;margin:12px 0">${(items as Item[])
        .map((i) => `<li>${escapeHtml(i.quantity ?? i.qty ?? 1)} &times; ${escapeHtml(i.title)}${i.variant_title || i.size ? ` (${escapeHtml(i.variant_title ?? i.size)})` : ""}</li>`)
        .join("")}</ul>`
    : "";

export function renderEmail(template: string, data: Data): { subject: string; html: string } {
  const url = String(data.url ?? "");
  switch (template) {
    case "order-placed": {
      const pre = data.preorder as { paid_now?: number; balance?: number; ready_by?: string } | undefined;
      return {
        subject: `We received your order #${data.display_id}`,
        html: layout({
          preheader: "Thank you for your order.",
          title: `Thank you${data.name ? `, ${String(data.name).split(" ")[0]}` : ""}.`,
          body: `<p>We received your order <strong>#${escapeHtml(data.display_id)}</strong>. We will contact you to confirm sizes, the price and delivery.</p>${itemsList(data.items)}<p><strong>Total: ${escapeHtml(money(data.total, String(data.currency ?? "GHS")))}</strong></p>${
            pre?.balance ? `<p style="background:#252e42;border-radius:10px;padding:12px 14px">Pre-order: ${escapeHtml(money(pre.paid_now))} paid now, ${escapeHtml(money(pre.balance))} to pay before delivery${pre.ready_by ? `. Expected: ${escapeHtml(pre.ready_by)}` : ""}.</p>` : ""
          }`,
          cta: url ? { label: "Track your order", url } : undefined,
        }),
      };
    }
    case "order-update":
      return {
        subject: `Order #${data.display_id} ${data.status}`,
        html: layout({
          preheader: `Your order ${data.status}.`,
          title: `Your order ${data.status}.`,
          body: `<p>Order <strong>#${escapeHtml(data.display_id)}</strong> ${escapeHtml(data.status)}.</p>${itemsList(data.items)}<p>Questions? Reply on WhatsApp and we will help.</p>`,
          cta: url ? { label: "View your order", url } : undefined,
        }),
      };
    case "announcement":
      return {
        subject: String(data.title ?? "News from Urban Men"),
        html: layout({
          preheader: String(data.body ?? "").slice(0, 90),
          title: String(data.title ?? "News from Urban Men"),
          body: `<p>${escapeHtml(data.body)}</p>`,
          cta: url ? { label: String(data.cta_label ?? "See what is new"), url } : undefined,
        }),
      };
    case "admin-alert":
    default: {
      const lines = Array.isArray(data.lines) ? (data.lines as unknown[]) : [];
      return {
        subject: String(data.title ?? "Update from the shop"),
        html: layout({
          preheader: String(data.title ?? ""),
          title: String(data.title ?? "Update from the shop"),
          body: lines.map((l) => `<p style="margin:6px 0">${escapeHtml(l)}</p>`).join(""),
          cta: url ? { label: String(data.cta_label ?? "Open in admin"), url } : undefined,
        }),
      };
    }
  }
}
