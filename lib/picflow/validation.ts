const ALLOWED_PICFLOW_HOSTS = new Set([
  "galleryphotovideobella.com",
  "galleryphotovideobella.picflow.com",
]);

export const GALLERY_STATUSES = ["preparing", "proofing", "delivered"] as const;
export type GalleryStatus = (typeof GALLERY_STATUSES)[number];

type GalleryInputResult =
  | { success: true; data: { url: string | null; status: GalleryStatus } }
  | { success: false; message: string };

export function parsePicflowGalleryInput(formData: FormData): GalleryInputResult {
  const rawUrl = String(formData.get("picflowGalleryUrl") ?? "").trim();
  const status = String(formData.get("galleryStatus") ?? "preparing");

  if (!GALLERY_STATUSES.includes(status as GalleryStatus)) {
    return { success: false, message: "El estado de la galería no es válido." };
  }

  if (!rawUrl) {
    return { success: true, data: { url: null, status: status as GalleryStatus } };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { success: false, message: "Escribe un enlace completo y válido de Picflow." };
  }

  if (url.protocol !== "https:" || !ALLOWED_PICFLOW_HOSTS.has(url.hostname.toLowerCase())) {
    return {
      success: false,
      message: "La galería debe usar galleryphotovideobella.com o el dominio oficial de Picflow.",
    };
  }

  url.hash = "";
  return { success: true, data: { url: url.toString(), status: status as GalleryStatus } };
}
