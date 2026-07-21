import { describe, expect, it } from "vitest";
import { parsePicflowGalleryInput } from "./validation";

function galleryForm(url: string, status = "proofing") {
  const formData = new FormData();
  formData.set("picflowGalleryUrl", url);
  formData.set("galleryStatus", status);
  return formData;
}

describe("parsePicflowGalleryInput", () => {
  it("accepts the Photo Video Bella custom gallery domain", () => {
    expect(parsePicflowGalleryInput(galleryForm("https://galleryphotovideobella.com/ashley"))).toEqual({
      success: true,
      data: { url: "https://galleryphotovideobella.com/ashley", status: "proofing" },
    });
  });

  it("accepts the existing Picflow workspace domain", () => {
    const result = parsePicflowGalleryInput(
      galleryForm("https://galleryphotovideobella.picflow.com/jenessis", "delivered"),
    );
    expect(result.success).toBe(true);
  });

  it("rejects non-Picflow and insecure links", () => {
    expect(parsePicflowGalleryInput(galleryForm("https://example.com/gallery")).success).toBe(false);
    expect(parsePicflowGalleryInput(galleryForm("http://galleryphotovideobella.com/gallery")).success).toBe(false);
  });

  it("allows an empty URL to unlink a gallery", () => {
    expect(parsePicflowGalleryInput(galleryForm("", "preparing"))).toEqual({
      success: true,
      data: { url: null, status: "preparing" },
    });
  });

  it("rejects an unsupported gallery status", () => {
    expect(parsePicflowGalleryInput(galleryForm("", "published"))).toEqual({
      success: false,
      message: "El estado de la galería no es válido.",
    });
  });
});
