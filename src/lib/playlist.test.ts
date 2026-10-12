import { describe, it, expect } from "vitest";
import { mergePlaylistVideos, updateVideoStatus, videoStatus, youtubeListId, youtubeVideoId } from "./playlist";
describe("Playlist tracking", () => {
  it("validates YouTube links", () => {
    expect(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeUndefined();
    expect(youtubeListId("https://www.youtube.com/playlist?list=PLtest")).toBe("PLtest");
  });
  it("migrates legacy watched videos and preserves manual overrides", () => {
    const v = { id: "1", ad: "Konu", izlendi: true };
    expect(videoStatus(v)).toBe("islendi");
    expect(videoStatus(updateVideoStatus(v, "isleniyor", false))).toBe("islendi");
    const manual = updateVideoStatus(v, "islenecek", true);
    expect(updateVideoStatus(manual, "islendi", false)).toEqual(manual);
  });
  it("tracks play and end events", () => {
    const v = { id: "1", ad: "Konu", izlendi: false };
    expect(videoStatus(updateVideoStatus(v, "isleniyor", false))).toBe("isleniyor");
    expect(updateVideoStatus(v, "islendi", false).izlendi).toBe(true);
  });
  it("merges discovered IDs without losing old progress or duplicating rows", () => {
    const result = mergePlaylistVideos([{ id: "old", ad: "Eski başlık", izlendi: true }], ["dQw4w9WgXcQ", "dQw4w9WgXcQ"]);
    expect(result).toHaveLength(1);
    expect(result[0]?.izlendi).toBe(true);
    expect(result[0]?.ad).toBe("Eski başlık");
    expect(mergePlaylistVideos(result, ["dQw4w9WgXcQ"])).toEqual(result);
  });
});