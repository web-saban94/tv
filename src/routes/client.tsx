// ============================================================================
// File: src/routes/client.tsx
// Route: /client — Customer Dedicated Mobile App (Clean Light UI)
// ============================================================================

import { createFileRoute } from "@tanstack/react-router";
import QrCustomerApp from "./qr";

export const Route = createFileRoute("/client")({
  component: QrCustomerApp,
});

export default QrCustomerApp;
