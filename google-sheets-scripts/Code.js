/**
 * ============================================================================
 * ח. סבן חומרי בניין (1994) בע״מ | SabanOS Signage CMS Gateway
 * קובץ: google-sheets-scripts/Code.js
 * גרסה: 3.5.0 - ניהול והזרקת תוכן ומדיה לשילוט
 * יעד: גיליון "שילוט" / טאב '📦 קטלוג_מוצרים'
 * ============================================================================
 */

const DEFAULT_SPREADSHEET_ID = "1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c";
const TARGET_CATALOG_SHEET_NAME = "📦 קטלוג_מוצרים";

const COL = {
  SKU: 1,               // עמודה A - מק״ט (נעול)
  NAME: 2,              // עמודה B - שם מוצר (נעול)
  BRAND: 3,             // עמודה C - מותג
  CATEGORY: 4,          // עמודה D - קטגוריה
  BASE_PRICE: 5,        // עמודה E - מחירון
  UNIT: 6,              // עמודה F - יחידה
  SALE_TAG: 7,          // עמודה G - תגית מבצע
  COVERAGE_M2: 8,       // עמודה H - כושר כיסוי (מ״ר)
  COVERAGE_NOTE: 9,     // עמודה I - הערת כיסוי
  IMAGE_URL: 20,        // עמודה T - קישור לתמונה
  VIDEO_URL: 21,        // עמודה U - קישור לסרטון הדרכה
  TDS_URL: 22,          // עמודה V - קישור TDS טכני
  ACTIVE_SIGNAGE: 24    // עמודה X - פעיל בשילוט (TRUE/FALSE)
};

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || "products";

    if (action === "ping") {
      return jsonResponse({
        status: "success",
        message: "Saban Signage CMS API is active & operational",
        sheetId: getSpreadsheet().getId(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "products" || action === "catalog") {
      return handleGetProducts();
    }

    return jsonResponse({
      status: "error",
      message: "Unsupported GET action: " + action
    }, 400);

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: "doGet failed: " + err.toString()
    }, 500);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "Missing POST body" }, 400);
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ status: "error", message: "Malformed JSON payload" }, 400);
    }

    const action = data.action || "update_product";

    if (action === "update_product" || action === "update") {
      return handleUpdateProduct(data);
    } else if (action === "batch_update") {
      return handleBatchUpdate(data.items || []);
    } else if (action === "append_order") {
      return handleAppendOrderLegacy(data.order);
    } else if (action === "log_chat") {
      return handleLogChatLegacy(data.chat);
    } else {
      return jsonResponse({ status: "error", message: "Unknown action: " + action }, 400);
    }

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: "doPost failed: " + err.toString()
    }, 500);
  }
}

function getSpreadsheet() {
  try {
    const bound = SpreadsheetApp.getActiveSpreadsheet();
    if (bound) return bound;
  } catch (e) {
    //
  }
  return SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
}

function getCatalogSheet(ss) {
  const primary = ss.getSheetByName(TARGET_CATALOG_SHEET_NAME);
  if (primary) return primary;

  const fallbacks = ["קטלוג_מוצרים", "קטלוג", "Products", "Catalog"];
  for (let i = 0; i < fallbacks.length; i++) {
    const sheet = ss.getSheetByName(fallbacks[i]);
    if (sheet) return sheet;
  }

  const sheets = ss.getSheets();
  return sheets.length > 0 ? sheets[0] : null;
}

function handleGetProducts() {
  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) {
    return jsonResponse({
      status: "error",
      message: "Sheet '" + TARGET_CATALOG_SHEET_NAME + "' not found"
    }, 404);
  }

  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), 24);

  if (lastRow < 2) {
    return jsonResponse({
      status: "success",
      count: 0,
      products: []
    });
  }

  const rangeValues = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const products = [];

  for (let i = 0; i < rangeValues.length; i++) {
    const row = rangeValues[i];
    const rawSku = row[COL.SKU - 1];
    if (rawSku === undefined || rawSku === null || String(rawSku).trim() === "") {
      continue;
    }

    const sku = String(rawSku).trim();
    const name = String(row[COL.NAME - 1] || "").trim();
    const brand = String(row[COL.BRAND - 1] || "").trim();
    const category = String(row[COL.CATEGORY - 1] || "").trim();
    const basePrice = Number(row[COL.BASE_PRICE - 1]) || 0;
    const unitLabel = String(row[COL.UNIT - 1] || "").trim();

    const saleTag = String(row[COL.SALE_TAG - 1] || "").trim();
    const rawCoverage = row[COL.COVERAGE_M2 - 1];
    const coverageM2 = (rawCoverage !== "" && !isNaN(Number(rawCoverage))) ? Number(rawCoverage) : null;
    const coverageNote = String(row[COL.COVERAGE_NOTE - 1] || "").trim();

    const imageUrl = String(row[COL.IMAGE_URL - 1] || "").trim();
    const videoUrl = String(row[COL.VIDEO_URL - 1] || "").trim();
    const tdsUrl = String(row[COL.TDS_URL - 1] || "").trim();

    const rawActive = row[COL.ACTIVE_SIGNAGE - 1];
    const activeInSignage = parseBoolean(rawActive);

    products.push({
      rowIndex: i + 2,
      sku: sku,
      name: name,
      brand: brand,
      category: category,
      basePrice: basePrice,
      unitLabel: unitLabel,
      saleTag: saleTag,
      coverageM2: coverageM2,
      coverageNote: coverageNote,
      imageUrl: imageUrl,
      videoUrl: videoUrl,
      tdsUrl: tdsUrl,
      activeInSignage: activeInSignage
    });
  }

  return jsonResponse({
    status: "success",
    count: products.length,
    sheetName: sheet.getName(),
    timestamp: new Date().toISOString(),
    products: products
  });
}

function handleUpdateProduct(payload) {
  if (!payload.sku) {
    return jsonResponse({ status: "error", message: "Missing required 'sku' parameter" }, 400);
  }

  const targetSku = String(payload.sku).trim();
  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) {
    return jsonResponse({ status: "error", message: "Catalog sheet not found" }, 404);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonResponse({ status: "error", message: "Catalog sheet is empty" }, 404);
  }

  const skuValues = sheet.getRange(2, COL.SKU, lastRow - 1, 1).getValues();
  let foundRow = -1;

  for (let i = 0; i < skuValues.length; i++) {
    const currentSku = String(skuValues[i][0]).trim();
    if (currentSku === targetSku) {
      foundRow = i + 2;
      break;
    }
  }

  if (foundRow === -1) {
    return jsonResponse({
      status: "error",
      message: "Product SKU not found in sheet: " + targetSku
    }, 404);
  }

  // עדכון השדות המותרים בלבד:
  if (payload.saleTag !== undefined) {
    sheet.getRange(foundRow, COL.SALE_TAG).setValue(String(payload.saleTag).trim());
  }
  if (payload.coverageM2 !== undefined) {
    const covVal = payload.coverageM2 === null || payload.coverageM2 === "" ? "" : Number(payload.coverageM2);
    sheet.getRange(foundRow, COL.COVERAGE_M2).setValue(covVal);
  }
  if (payload.coverageNote !== undefined) {
    sheet.getRange(foundRow, COL.COVERAGE_NOTE).setValue(String(payload.coverageNote).trim());
  }
  if (payload.imageUrl !== undefined) {
    sheet.getRange(foundRow, COL.IMAGE_URL).setValue(String(payload.imageUrl).trim());
  }
  if (payload.videoUrl !== undefined) {
    sheet.getRange(foundRow, COL.VIDEO_URL).setValue(String(payload.videoUrl).trim());
  }
  if (payload.tdsUrl !== undefined) {
    sheet.getRange(foundRow, COL.TDS_URL).setValue(String(payload.tdsUrl).trim());
  }
  if (payload.activeInSignage !== undefined) {
    const boolVal = parseBoolean(payload.activeInSignage);
    sheet.getRange(foundRow, COL.ACTIVE_SIGNAGE).setValue(boolVal ? "TRUE" : "FALSE");
  }

  SpreadsheetApp.flush();

  return jsonResponse({
    status: "success",
    message: "מוצר " + targetSku + " עודכן בהצלחה בגיליון '📦 קטלוג_מוצרים'",
    sku: targetSku,
    updatedRow: foundRow,
    timestamp: new Date().toISOString()
  });
}

function handleBatchUpdate(items) {
  if (!items || !items.length) {
    return jsonResponse({ status: "error", message: "No items provided for batch update" }, 400);
  }

  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) {
    return jsonResponse({ status: "error", message: "Catalog sheet not found" }, 404);
  }

  const lastRow = sheet.getLastRow();
  const skuValues = sheet.getRange(2, COL.SKU, lastRow - 1, 1).getValues();
  const skuToRowMap = {};
  for (let i = 0; i < skuValues.length; i++) {
    const s = String(skuValues[i][0]).trim();
    if (s) skuToRowMap[s] = i + 2;
  }

  let updatedCount = 0;
  for (let j = 0; j < items.length; j++) {
    const item = items[j];
    const s = String(item.sku).trim();
    const row = skuToRowMap[s];
    if (!row) continue;

    if (item.saleTag !== undefined) sheet.getRange(row, COL.SALE_TAG).setValue(String(item.saleTag).trim());
    if (item.coverageM2 !== undefined) sheet.getRange(row, COL.COVERAGE_M2).setValue(item.coverageM2);
    if (item.coverageNote !== undefined) sheet.getRange(row, COL.COVERAGE_NOTE).setValue(String(item.coverageNote).trim());
    if (item.imageUrl !== undefined) sheet.getRange(row, COL.IMAGE_URL).setValue(String(item.imageUrl).trim());
    if (item.videoUrl !== undefined) sheet.getRange(row, COL.VIDEO_URL).setValue(String(item.videoUrl).trim());
    if (item.tdsUrl !== undefined) sheet.getRange(row, COL.TDS_URL).setValue(String(item.tdsUrl).trim());
    if (item.activeInSignage !== undefined) sheet.getRange(row, COL.ACTIVE_SIGNAGE).setValue(parseBoolean(item.activeInSignage) ? "TRUE" : "FALSE");
    updatedCount++;
  }

  SpreadsheetApp.flush();
  return jsonResponse({
    status: "success",
    message: "עודכנו " + updatedCount + " מוצרים בהצלחה",
    updatedCount: updatedCount
  });
}

function handleAppendOrderLegacy(order) {
  if (!order) return jsonResponse({ status: "error", message: "Missing order object" }, 400);
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName("הזמנות") || ss.getSheetByName("🏗️ הזמנות_סניף_החרש") || ss.getSheets()[0];
  const orderId = order.id || order.orderId || Utilities.getUuid().slice(0, 8);
  sheet.appendRow([
    new Date(),
    orderId,
    order.clientPhone || order.phone || "",
    order.clientName || "",
    order.warehouse || order.branchName || "סניף החרש 4",
    order.sku || "",
    order.productName || "",
    order.quantity || 1,
    order.estimatedCost || 0,
    "מוכן בדלפק",
    new Date().toISOString()
  ]);
  return jsonResponse({ status: "success", orderId: orderId });
}

function handleLogChatLegacy(chat) {
  if (!chat) return jsonResponse({ status: "error", message: "Missing chat object" }, 400);
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("💬 יומן_שיחות_נועה") || ss.getSheetByName("לוג_שיחות");
  if (!sheet) {
    sheet = ss.insertSheet("💬 יומן_שיחות_נועה");
    sheet.appendRow(["זמן", "מק״ט", "שם מוצר", "סניף", "שאלה", "תשובה", "כמות"]);
  }
  sheet.appendRow([
    new Date(),
    chat.sku || "",
    chat.productName || "",
    chat.branch || "",
    chat.question || "",
    chat.answer || "",
    chat.quantity || ""
  ]);
  return jsonResponse({ status: "success", logged: true });
}

function parseBoolean(val) {
  if (val === true || val === 1 || val === "1") return true;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return s === "true" || s === "כן" || s === "v" || s === "פעיל";
  }
  return false;
}

function jsonResponse(data) {
  const jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}
