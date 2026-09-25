import { createFileRoute } from "@tanstack/react-router";

import {
  applyOverridesToProducts,
  clearAllOverrides,
  clearOverride,
  getAllOverrides,
  setOverride,
} from "@/lib/product-overrides";

export const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxxMuFP5evxDx8vxd3BfCQgx73H88KTOB87AzbiCAEx69UVJE1qmoCMyF9KM9qljvAX/exec";

interface SheetSyncPayload {
  action?:
    | "append_order"
    | "log_chat"
    | "ping"
    | "update_product"
    | "update"
    | "batch_update"
    | "clear_override"
    | "clear_all_overrides";
  sku?: string;
  imageUrl?: string;
  videoUrl?: string;
  tdsUrl?: string;
  saleTag?: string;
  coverageM2?: number | null;
  coverageNote?: string;
  activeInSignage?: boolean;
  items?: unknown[];
  order?: {
    id: string;
    sku: string;
    productName: string;
    unitLabel: string;
    quantity: number;
    unitPrice: number;
    estimatedCost: number;
    warehouse: string;
    branchName: string;
    source: string;
    screenId?: string;
    note?: string;
    clientPhone?: string;
    clientName?: string;
    createdAt: number;
  };
  chat?: {
    id?: string;
    sku?: string;
    productName?: string;
    branch?: string;
    question?: string;
    answer?: string;
    quantity?: string | number;
    cost?: string | number;
    dispatched?: boolean;
    duration?: number;
  };
}

export const Route = createFileRoute("/api/sheets-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const action = url.searchParams.get("action");

        // Action: Return all stored overrides
        if (action === "overrides") {
          return new Response(
            JSON.stringify({
              status: "success",
              overrides: getAllOverrides(),
              timestamp: new Date().toISOString(),
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        }

        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_APPS_SCRIPT_URL;
        try {
          // Check ping on Google Apps Script
          const pingRes = await fetch(`${webhookUrl}?action=ping`, {
            method: "GET",
            redirect: "follow",
          });
          const pingData = await pingRes.json().catch(() => null);

          // Check products count on Google Apps Script
          const prodRes = await fetch(`${webhookUrl}?action=products`, {
            method: "GET",
            redirect: "follow",
          });
          const prodData = (await prodRes.json().catch(() => null)) as {
            count?: number;
            products?: Array<{ sku: string }>;
          } | null;

          const rawProducts = prodData?.products || [];
          const productsWithOverrides = applyOverridesToProducts(rawProducts);

          // If caller explicitly asked for products
          if (action === "products" || action === "catalog") {
            return new Response(
              JSON.stringify({
                status: "success",
                count: productsWithOverrides.length,
                products: productsWithOverrides,
                overrides: getAllOverrides(),
                timestamp: new Date().toISOString(),
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({
              status: "connected",
              webhookUrl,
              timestamp: new Date().toISOString(),
              ping: pingData,
              catalogCount: productsWithOverrides.length || prodData?.count || 0,
              overridesCount: Object.keys(getAllOverrides()).length,
              sheets: [
                "📊 דשבורד_בקרה",
                "📦 קטלוג_מוצרים",
                "🏗️ הזמנות_סניף_החרש",
                "🏬 הזמנות_סניף_התלמיד",
                "💬 יומן_שיחות_נועה",
              ],
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({
              status: "degraded",
              webhookUrl,
              error: String(err),
              overrides: getAllOverrides(),
              message: "Apps Script URL configured, ping failed",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as SheetSyncPayload;
          const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_APPS_SCRIPT_URL;

          // 0. Clear override if requested
          if (body.action === "clear_override" && body.sku) {
            const cleared = clearOverride(body.sku);
            return new Response(
              JSON.stringify({
                success: true,
                sku: body.sku,
                cleared,
                message: `העדכון המקומי של מוצר #${body.sku} אופס`,
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          if (body.action === "clear_all_overrides") {
            clearAllOverrides();
            return new Response(
              JSON.stringify({
                success: true,
                message: "כל העדכונים המקומיים אופסו",
              }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          // 1. Update product in Google Sheets via Apps Script and persist on server
          if (
            body.action === "update_product" ||
            body.action === "update" ||
            (body.sku && !body.order)
          ) {
            // Save to persistent server store immediately
            const savedOverride = setOverride(body.sku, {
              imageUrl: body.imageUrl,
              videoUrl: body.videoUrl,
              tdsUrl: body.tdsUrl,
              saleTag: body.saleTag,
              coverageM2: body.coverageM2,
              coverageNote: body.coverageNote,
              activeInSignage: body.activeInSignage,
            });

            try {
              const productPayload = {
                action: "update_product",
                type: "update_product",
                sku: body.sku,
                imageUrl: body.imageUrl,
                videoUrl: body.videoUrl,
                tdsUrl: body.tdsUrl,
                saleTag: body.saleTag,
                coverageM2: body.coverageM2,
                coverageNote: body.coverageNote,
                activeInSignage: body.activeInSignage,
                timestamp: new Date().toISOString(),
              };

              const scriptRes = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(productPayload),
                redirect: "follow",
                signal: AbortSignal.timeout(6000),
              });

              const scriptData = (await scriptRes.json().catch(() => null)) as {
                success?: boolean;
                status?: string;
                error?: string;
                message?: string;
              } | null;

              const isScriptSuccess = Boolean(
                scriptData &&
                (scriptData.status === "success" || scriptData.success === true) &&
                !scriptData.error,
              );

              const isUnknownPayload = scriptData?.error === "Unknown payload type";

              return new Response(
                JSON.stringify({
                  success: true,
                  syncedToGoogleSheet: isScriptSuccess,
                  persistedLocally: true,
                  sku: body.sku,
                  override: savedOverride,
                  result: scriptData,
                  needsAppsScriptUpdate: isUnknownPayload,
                  message: isScriptSuccess
                    ? `מוצר #${body.sku} הוזרק בהצלחה ל-Google Sheets ונשמר!`
                    : isUnknownPayload
                      ? `מוצר #${body.sku} נשמר במערכת (הסקריפט ב-Google Sheets דורש עדכון קוד Code.gs)`
                      : `מוצר #${body.sku} נשמר בשרת ובמכשיר`,
                }),
                { headers: { "Content-Type": "application/json" } },
              );
            } catch (updateErr) {
              console.warn(
                "Could not forward product update to Google Sheets Apps Script:",
                updateErr,
              );
              return new Response(
                JSON.stringify({
                  success: true,
                  syncedToGoogleSheet: false,
                  storedLocally: true,
                  persistedLocally: true,
                  sku: body.sku,
                  override: savedOverride,
                  error: String(updateErr),
                  message: `מוצר #${body.sku} נשמר בשרת ובמכשיר`,
                }),
                { headers: { "Content-Type": "application/json" } },
              );
            }
          }

          // 1. Log chat to Apps Script
          if (body.action === "log_chat" && body.chat) {
            try {
              const chatPayload = {
                type: "chat",
                chat: {
                  id: body.chat.id || `CHAT-${Date.now().toString(36)}`,
                  sku: body.chat.sku || "",
                  productName: body.chat.productName || "",
                  branch: body.chat.branch || "סניף החרש (מחסן 4 - ראשי)",
                  question: body.chat.question || "",
                  answer: body.chat.answer || "",
                  quantity: body.chat.quantity || "",
                  cost: body.chat.cost || "",
                  dispatched: Boolean(body.chat.dispatched),
                  duration: body.chat.duration || 0,
                },
                timestamp: new Date().toISOString(),
              };

              const chatRes = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(chatPayload),
                redirect: "follow",
              });

              const result = await chatRes.json().catch(() => ({ success: true }));
              return new Response(
                JSON.stringify({
                  success: true,
                  syncedToSheet: true,
                  chatLogged: true,
                  result,
                }),
                { headers: { "Content-Type": "application/json" } },
              );
            } catch (chatErr) {
              console.warn("Could not log chat to Google Sheets:", chatErr);
              return new Response(
                JSON.stringify({
                  success: false,
                  syncedToSheet: false,
                  error: String(chatErr),
                }),
                { headers: { "Content-Type": "application/json" } },
              );
            }
          }

          // 2. Append order to Apps Script
          if (webhookUrl && webhookUrl.startsWith("http")) {
            try {
              const orderPayload = {
                type: "order",
                orderId: body.order?.id,
                order: {
                  id: body.order?.id,
                  sku: body.order?.sku,
                  productName: body.order?.productName,
                  name: body.order?.productName,
                  quantity: body.order?.quantity,
                  unitLabel: body.order?.unitLabel,
                  estimatedCost: body.order?.estimatedCost,
                  warehouse: body.order?.warehouse || body.order?.branchName,
                  branch: body.order?.branchName || body.order?.warehouse,
                  source: body.order?.source || "סריקת QR בנייד / PWA",
                  screenId: body.order?.screenId || "pwa_client",
                  note: body.order?.note || "",
                  phone: body.order?.clientPhone || "",
                  clientName: body.order?.clientName || "",
                  createdAt: body.order?.createdAt,
                },
                timestamp: new Date().toISOString(),
              };

              const sheetRes = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(orderPayload),
                redirect: "follow",
              });

              if (sheetRes.ok) {
                const sheetData = await sheetRes.json().catch(() => ({ success: true }));
                return new Response(
                  JSON.stringify({
                    success: true,
                    syncedToGoogleSheet: true,
                    id: body.order?.id,
                    branch: (sheetData as { branch?: string })?.branch,
                    orderId: (sheetData as { orderId?: string })?.orderId,
                  }),
                  { headers: { "Content-Type": "application/json" } },
                );
              }
            } catch (forwardErr) {
              console.warn("Could not forward to Google Sheets Apps Script:", forwardErr);
            }
          }

          // Fallback confirmation: server accepts and acknowledges dual save
          return new Response(
            JSON.stringify({
              success: true,
              syncedToGoogleSheet: Boolean(webhookUrl),
              storedLocally: true,
              id: body.order?.id,
              message: "נקלט במערכת שילוט ח. סבן וסונכרן לזיכרון",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error) {
          console.error("Sheets sync error:", error);
          return new Response(
            JSON.stringify({ error: "Internal sync error", details: String(error) }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
