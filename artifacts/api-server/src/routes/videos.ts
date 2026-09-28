import { Router, type IRouter } from "express";
import { randomUUID } from "node:crypto";
import {
  GenerateVideoBody,
  GenerateVideoResponse,
  GetVideoParams,
  GetVideoResponse,
  ListVideosResponse,
} from "@workspace/api-zod";

type VideoScene = {
  id: string;
  start: number;
  end: number;
  title: string;
  caption: string;
  visual: string;
  accent: string;
};

type VideoProject = {
  id: string;
  prompt: string;
  title: string;
  aspectRatio: string;
  style: string;
  duration: number;
  createdAt: string;
  status: "ready";
  scenes: VideoScene[];
};

const videos = new Map<string, VideoProject>();

const styleCopy: Record<string, string> = {
  cinematic: "cinematic light, deliberate camera movement, tactile detail",
  editorial: "editorial composition, crisp cuts, considered negative space",
  dreamlike: "soft bloom, floating motion, surreal transitions",
  kinetic: "kinetic pacing, bold graphic movement, confident energy",
};

const styleAccents: Record<string, string[]> = {
  cinematic: ["#ffb56b", "#ff735c", "#d8a7ff"],
  editorial: ["#f2d58a", "#a8d8ff", "#f2a7c0"],
  dreamlike: ["#b7a0ff", "#8fe7da", "#ffc1e3"],
  kinetic: ["#ffe06b", "#ff6b8a", "#63d7ff"],
};

function cleanTitle(prompt: string): string {
  const words = prompt
    .replace(/[^\w\s'-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 7);
  const title = words.join(" ");
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : "Untitled scene";
}

function makeScenes(prompt: string, style: string): VideoScene[] {
  const subject = prompt.trim().replace(/[.!?]+$/, "");
  const visualLanguage = styleCopy[style] ?? styleCopy.cinematic;
  const accents = styleAccents[style] ?? styleAccents.cinematic;

  return [
    {
      id: "scene-01",
      start: 0,
      end: 5,
      title: "The opening frame",
      caption: subject,
      visual: `Establish ${subject}; ${visualLanguage}.`,
      accent: accents[0],
    },
    {
      id: "scene-02",
      start: 5,
      end: 10,
      title: "The detail",
      caption: "Move closer. Let the idea breathe.",
      visual: `A closer, more tactile angle on ${subject}; ${visualLanguage}.`,
      accent: accents[1],
    },
    {
      id: "scene-03",
      start: 10,
      end: 15,
      title: "The final beat",
      caption: "Leave a clear impression.",
      visual: `A confident closing image for ${subject}; ${visualLanguage}.`,
      accent: accents[2],
    },
  ];
}

const router: IRouter = Router();

router.get("/videos", (req, res) => {
  const data = Array.from(videos.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 24);
  req.log.info({ count: data.length }, "Listed video projects");
  res.json(ListVideosResponse.parse(data));
});

router.post("/videos/generate", (req, res) => {
  const parsed = GenerateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid video generation request");
    res.status(400).json({ error: "Add a prompt of at least 8 characters." });
    return;
  }

  const prompt = parsed.data.prompt.trim();
  const style = parsed.data.style ?? "cinematic";
  const project: VideoProject = {
    id: randomUUID(),
    prompt,
    title: cleanTitle(prompt),
    aspectRatio: parsed.data.aspectRatio ?? "16:9",
    style,
    duration: 15,
    createdAt: new Date().toISOString(),
    status: "ready",
    scenes: makeScenes(prompt, style),
  };

  videos.set(project.id, project);
  req.log.info(
    { id: project.id, aspectRatio: project.aspectRatio, style: project.style },
    "Created video project",
  );
  res.status(201).json(GenerateVideoResponse.parse(project));
});

router.get("/videos/:id", (req, res) => {
  const parsed = GetVideoParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(404).json({ error: "Video project not found." });
    return;
  }

  const project = videos.get(parsed.data.id);
  if (!project) {
    res.status(404).json({ error: "Video project not found." });
    return;
  }

  res.json(GetVideoResponse.parse(project));
});

export default router;