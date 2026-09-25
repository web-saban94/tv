/**
 * ============================================================================
 * ח. סבן חומרי בניין (1994) בע״מ | SabanOS Signage CMS Gateway
 * קובץ: google-sheets-scripts/Code.js
 * גרסה: 3.7.0 - ניהול והזרקת מדיה לגיליון '📦 קטלוג_מוצרים'
 * ============================================================================
 * 
 * הוראות התקנה ב-Google Sheets:
 * 1. פתח את הגיליון "שילוט" ב-Google Sheets
 * 2. לחץ על תפריט Extensions (תוספים) -> Apps Script
 * 3. מחק את כל הקוד הקיים והדבק את תוכן הקובץ הזה במלואו
 * 4. לחץ על Deploy (פריסה) -> New deployment (או Manage deployments -> ערוך לגרסה חדשה)
 *    - Type: Web app
 *    - Description: Saban Signage CMS Media Gateway
 *    - Execute as: Me (המשתמש שלך)
 *    - Who has access: Anyone (פתוח לכולם)
 * 5. העתק את ה-Web App URL שנוצר והגדר אותו בממשק ה-CMS.
 */

const TARGET_CATALOG_SHEET_NAME = "📦 קטלוג_מוצרים";

const SPREADSHEET_CANDIDATE_IDS = [
  "1UUnQxlLuPAc5fVfTI277w9ByxFSwrD2giYkoXIPC7sI",
  "1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c"
];

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || "products";

    if (action === "ping") {
      const ss = getSpreadsheet();
      const sheet = getCatalogSheet(ss);
      return jsonResponse({
        status: "success",
        success: true,
        message: "Saban Signage CMS API is active & operational (v3.7.0)",
        sheetName: sheet ? sheet.getName() : "Unknown",
        sheetId: ss ? ss.getId() : "Unknown",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "test_injection") {
      return handleTestInjection(params.sku || "10701");
    }

    if (action === "products" || action === "catalog") {
      return handleGetProducts();
    }

    return jsonResponse({
      status: "error",
      success: false,
      message: "Unsupported GET action: " + action
    }, 400);

  } catch (err) {
    return jsonResponse({
      status: "error",
      success: false,
      message: "doGet failed: " + err.toString()
    }, 500);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", success: false, message: "Missing POST body" }, 400);
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ status: "error", success: false, message: "Malformed JSON payload: " + parseErr.message }, 400);
    }

    let action = data.action;
    if (!action) {
      if (data.type === "order" || data.order) {
        action = "append_order";
      } else if (data.type === "chat" || data.chat) {
        action = "log_chat";
      } else if (data.type === "update_product" || data.sku) {
        action = "update_product";
      } else {
        action = "unknown";
      }
    }

    if (action === "update_product" || action === "update") {
      return handleUpdateProduct(data);
    } else if (action === "batch_update") {
      return handleBatchUpdate(data.items || []);
    } else if (action === "append_order") {
      return handleAppendOrderLegacy(data.order || data);
    } else if (action === "log_chat") {
      return handleLogChatLegacy(data.chat || data);
    } else {
      return jsonResponse({ status: "error", success: false, message: "Unknown action: " + action }, 400);
    }

  } catch (err) {
    return jsonResponse({
      status: "error",
      success: false,
      message: "doPost failed: " + err.toString()
    }, 500);
  }
}

function getSpreadsheet() {
  try {
    const bound = SpreadsheetApp.getActiveSpreadsheet();
    if (bound) return bound;
  } catch (e) {
    // Non-bound execution
  }

  for (let i = 0; i < SPREADSHEET_CANDIDATE_IDS.length; i++) {
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_CANDIDATE_IDS[i]);
      if (ss) return ss;
    } catch (err) {
      // Continue next
    }
  }

  throw new Error("לא ניתן לגשת לקובץ Google Sheets. יש להתקין את הסקריפט ישירות דרך תפריט Extensions -> Apps Script בתוך הגיליון.");
}

function getCatalogSheet(ss) {
  if (!ss) return null;
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

function getColumnMapping(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 24);
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  const findCol = function(candidates, defaultIndex) {
    for (let i = 0; i < headerRow.length; i++) {
      const h = String(headerRow[i] || "").trim().toLowerCase();
      for (let j = 0; j < candidates.length; j++) {
        if (h === candidates[j].toLowerCase() || h.indexOf(candidates[j].toLowerCase()) !== -1) {
          return i + 1;
        }
      }
    }
    return defaultIndex;
  };

  return {
    sku: findCol(["מק״ט SKU", "מק\"ט", "sku", "מק״ט"], 1),
    name: findCol(["שם המוצר", "שם", "name"], 2),
    category: findCol(["קטגוריה", "category"], 3),
    brand: findCol(["מותג", "brand"], 4),
    basePrice: findCol(["מחירון", "מחיר מחירון"], 5),
    unit: findCol(["יחידת אריזה", "יחידה", "unit"], 10),
    saleTag: findCol(["תגית מבצע", "מבצע"], 7),
    coverageM2: findCol(["כושר כיסוי", "כיסוי (מ״ר)"], 8),
    coverageNote: findCol(["הערת כיסוי"], 9),
    imageUrl: findCol(["קישור לתמונה", "תמונה", "image"], 20),
    videoUrl: findCol(["קישור לסרטון הדרכה", "סרטון", "youtube"], 21),
    tdsUrl: findCol(["קישור TDS טכני", "tds"], 22),
    activeInSignage: findCol(["פעיל בשילוט", "שילוט"], 24)
  };
}

function handleGetProducts() {
  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) {
    return jsonResponse({ status: "error", success: false, message: "טאב '" + TARGET_CATALOG_SHEET_NAME + "' לא נמצא" }, 404);
  }

  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), 24);

  if (lastRow < 2) {
    return jsonResponse({ status: "success", success: true, count: 0, products: [] });
  }

  const colMap = getColumnMapping(sheet);
  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const products = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rawSku = row[colMap.sku - 1];
    if (rawSku === undefined || rawSku === null || String(rawSku).trim() === "") {
      continue;
    }

    const sku = String(rawSku).trim();
    const name = String(row[colMap.name - 1] || "").trim();
    const brand = String(row[colMap.brand - 1] || "").trim();
    const category = String(row[colMap.category - 1] || "").trim();
    const basePrice = Number(row[colMap.basePrice - 1]) || 0;
    const unitLabel = String(row[colMap.unit - 1] || "יח׳").trim();

    const saleTag = String(row[colMap.saleTag - 1] || "").trim();
    const rawCoverage = row[colMap.coverageM2 - 1];
    const coverageM2 = (rawCoverage !== "" && !isNaN(Number(rawCoverage))) ? Number(rawCoverage) : null;
    const coverageNote = String(row[colMap.coverageNote - 1] || "").trim();

    const imageUrl = String(row[colMap.imageUrl - 1] || "").trim();
    const videoUrl = String(row[colMap.videoUrl - 1] || "").trim();
    const tdsUrl = String(row[colMap.tdsUrl - 1] || "").trim();

    const activeInSignage = parseBoolean(row[colMap.activeInSignage - 1]);

    products.push({
      rowIndex: i + 2,
      sku: sku,
      name: name,
      brand: brand,
      category: category,
      basePrice: basePrice,
      price: basePrice,
      unitLabel: unitLabel,
      saleTag: saleTag,
      discountTag: saleTag,
      coverageM2: coverageM2,
      coveragePerUnitM2: coverageM2,
      coverageNote: coverageNote,
      imageUrl: imageUrl,
      image: imageUrl,
      videoUrl: videoUrl,
      mediaUrl: videoUrl,
      tdsUrl: tdsUrl,
      activeInSignage: activeInSignage,
      isActive: activeInSignage
    });
  }

  return jsonResponse({
    status: "success",
    success: true,
    count: products.length,
    sheetName: sheet.getName(),
    products: products,
    timestamp: new Date().toISOString()
  });
}

function handleUpdateProduct(payload) {
  if (!payload.sku) {
    return jsonResponse({ status: "error", success: false, message: "Missing required 'sku'" }, 400);
  }

  const targetSku = String(payload.sku).trim();
  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) {
    return jsonResponse({ status: "error", success: false, message: "Catalog sheet not found" }, 404);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonResponse({ status: "error", success: false, message: "Catalog sheet is empty" }, 404);
  }

  const colMap = getColumnMapping(sheet);
  const skuValues = sheet.getRange(2, colMap.sku, lastRow - 1, 1).getValues();
  let foundRow = -1;

  for (let i = 0; i < skuValues.length; i++) {
    const s = String(skuValues[i][0]).trim();
    if (s === targetSku) {
      foundRow = i + 2;
      break;
    }
  }

  if (foundRow === -1) {
    return jsonResponse({
      status: "error",
      success: false,
      message: "מק״ט לא נמצא בגיליון: " + targetSku
    }, 404);
  }

  const updatedFields = [];

  // עמודה G: תגית מבצע
  if (payload.saleTag !== undefined) {
    sheet.getRange(foundRow, colMap.saleTag).setValue(String(payload.saleTag).trim());
    updatedFields.push("תגית מבצע");
  }

  // עמודה H: כושר כיסוי מ"ר
  if (payload.coverageM2 !== undefined) {
    const val = (payload.coverageM2 === null || payload.coverageM2 === "") ? "" : Number(payload.coverageM2);
    sheet.getRange(foundRow, colMap.coverageM2).setValue(val);
    updatedFields.push("כושר כיסוי");
  }

  // עמודה I: הערת כיסוי
  if (payload.coverageNote !== undefined) {
    sheet.getRange(foundRow, colMap.coverageNote).setValue(String(payload.coverageNote).trim());
    updatedFields.push("הערת כיסוי");
  }

  // עמודה T: קישור לתמונה
  if (payload.imageUrl !== undefined) {
    sheet.getRange(foundRow, colMap.imageUrl).setValue(String(payload.imageUrl).trim());
    updatedFields.push("קישור לתמונה");
  }

  // עמודה U: קישור לסרטון הדרכה
  if (payload.videoUrl !== undefined) {
    sheet.getRange(foundRow, colMap.videoUrl).setValue(String(payload.videoUrl).trim());
    updatedFields.push("קישור לסרטון");
  }

  // עמודה V: קישור TDS
  if (payload.tdsUrl !== undefined) {
    sheet.getRange(foundRow, colMap.tdsUrl).setValue(String(payload.tdsUrl).trim());
    updatedFields.push("קישור TDS");
  }

  // עמודה X: פעיל בשילוט?
  if (payload.activeInSignage !== undefined) {
    const boolVal = parseBoolean(payload.activeInSignage);
    sheet.getRange(foundRow, colMap.activeInSignage).setValue(boolVal ? "TRUE" : "FALSE");
    updatedFields.push("פעיל בשילוט");
  }

  SpreadsheetApp.flush();

  return jsonResponse({
    status: "success",
    success: true,
    message: "מוצר #" + targetSku + " עודכן בהצלחה בשורה " + foundRow + " בגיליון '" + sheet.getName() + "'",
    sku: targetSku,
    updatedRow: foundRow,
    updatedFields: updatedFields,
    timestamp: new Date().toISOString()
  });
}

function handleBatchUpdate(items) {
  if (!items || !items.length) {
    return jsonResponse({ status: "error", success: false, message: "No items provided" }, 400);
  }

  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) return jsonResponse({ status: "error", success: false, message: "Sheet not found" }, 404);

  const lastRow = sheet.getLastRow();
  const colMap = getColumnMapping(sheet);
  const skuValues = sheet.getRange(2, colMap.sku, lastRow - 1, 1).getValues();
  const skuToRow = {};
  for (let i = 0; i < skuValues.length; i++) {
    const s = String(skuValues[i][0]).trim();
    if (s) skuToRow[s] = i + 2;
  }

  let count = 0;
  for (let j = 0; j < items.length; j++) {
    const item = items[j];
    const row = skuToRow[String(item.sku).trim()];
    if (!row) continue;

    if (item.saleTag !== undefined) sheet.getRange(row, colMap.saleTag).setValue(String(item.saleTag).trim());
    if (item.coverageM2 !== undefined) sheet.getRange(row, colMap.coverageM2).setValue(item.coverageM2);
    if (item.coverageNote !== undefined) sheet.getRange(row, colMap.coverageNote).setValue(String(item.coverageNote).trim());
    if (item.imageUrl !== undefined) sheet.getRange(row, colMap.imageUrl).setValue(String(item.imageUrl).trim());
    if (item.videoUrl !== undefined) sheet.getRange(row, colMap.videoUrl).setValue(String(item.videoUrl).trim());
    if (item.tdsUrl !== undefined) sheet.getRange(row, colMap.tdsUrl).setValue(String(item.tdsUrl).trim());
    if (item.activeInSignage !== undefined) sheet.getRange(row, colMap.activeInSignage).setValue(parseBoolean(item.activeInSignage) ? "TRUE" : "FALSE");
    count++;
  }

  SpreadsheetApp.flush();
  return jsonResponse({ status: "success", success: true, updatedCount: count });
}

function handleTestInjection(sku) {
  const ss = getSpreadsheet();
  const sheet = getCatalogSheet(ss);
  if (!sheet) return jsonResponse({ status: "error", success: false, message: "Sheet not found" }, 404);

  return jsonResponse({
    status: "success",
    success: true,
    message: "בדיקת הזרקה הצליחה: הגיליון נגיש ומוכן לעדכונים",
    sku: sku,
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
    timestamp: new Date().toISOString()
  });
}

function handleAppendOrderLegacy(order) {
  return jsonResponse({
    status: "success",
    success: true,
    orderId: order ? order.id : "ORD-" + Date.now()
  });
}

function handleLogChatLegacy(chat) {
  return jsonResponse({
    status: "success",
    success: true,
    chatId: chat ? chat.id : "CHAT-" + Date.now()
  });
}

function parseBoolean(val) {
  if (typeof val === "boolean") return val;
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return s === "TRUE" || s === "1" || s === "YES" || s === "כן";
}

function jsonResponse(obj, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
