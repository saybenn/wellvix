// /lib/finders.js
// Dev JSON finders. TODO(Supabase): replace with SELECT by slug.

import fs from "fs";
import path from "path";

const root = process.cwd();
function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(root, "data", name), "utf8"));
}

export function findProviderBySlug(slug) {
  const providers = readJSON("providers.json");
  return providers.find((p) => p.slug === slug) || null;
}

export function findServiceByProviderAndSlug(providerId, serviceSlug) {
  const services = readJSON("provider_services.json");
  return (
    services.find(
      (s) => s.providerId === providerId && s.slug === serviceSlug && s.isActive
    ) || null
  );
}
