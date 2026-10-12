import { describe, it, expect } from "vitest";
import { providerMessages } from "./ai-message";
describe("Photo question messages", () => {
  it("keeps old text conversations compatible", () => {
    expect(providerMessages([{ role: "user", content: "Soru" }])).toEqual([{ role: "user", content: "Soru" }]);
  });
  it("sends the photo and question together to the vision provider", () => {
    expect(providerMessages([{ role: "user", content: "Çöz", image: "data:image/jpeg;base64,abc" }])[0]?.content).toEqual([
      { type: "text", text: "Çöz" }, { type: "image_url", image_url: { url: "data:image/jpeg;base64,abc" } },
    ]);
  });
});