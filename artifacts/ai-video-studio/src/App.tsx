import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clapperboard,
  Clock3,
  Copy,
  Download,
  Film,
  History,
  Layers3,
  LoaderCircle,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react';
import {
  getGetVideoQueryKey,
  getListVideosQueryKey,
  useGenerateVideo,
  useGetVideo,
  useListVideos,
} from '@workspace/api-client-react';
import type { VideoProject, VideoScene } from '@workspace/api-client-react';
import {
  Route,
  Switch,
  Link,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  return <StudioPage />;
}

type AspectRatio = '16:9' | '9:16' | '1:1';
type VideoStyle = 'cinematic' | 'editorial' | 'dreamlike' | 'kinetic';

const ratioOptions: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '16:9', label: 'Landscape', icon: '▰' },
  { value: '9:16', label: 'Portrait', icon: '▯' },
  { value: '1:1', label: 'Square', icon: '□' },
];

const styleOptions: { value: VideoStyle; label: string; note: string }[] = [
  { value: 'cinematic', label: 'Cinematic', note: 'Measured + atmospheric' },
  { value: 'editorial', label: 'Editorial', note: 'Clean + considered' },
  { value: 'dreamlike', label: 'Dreamlike', note: 'Soft + surreal' },
  { value: 'kinetic', label: 'Kinetic', note: 'Quick + energetic' },
];

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getAccent(accent: string, fallback = '#f6b849') {
  return accent?.startsWith('#') ? accent : fallback;
}

function StudioShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <div className="control-shell min-h-[100dvh] md:flex">
      <aside className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-[var(--sidebar-ink)] text-[#f4f0e7] transition-transform duration-300 md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between px-7 pb-8 pt-7">
          <Link href="/" data-testid="link-brand" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[var(--amber)] text-[var(--ink)]">
              <Clapperboard size={19} strokeWidth={2.4} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-.02em]">FRAME<span className="text-[var(--amber)]">/15</span></span>
          </Link>
          <button onClick={() => setMobileNav(false)} className="md:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X size={19} /></button>
        </div>
        <div className="px-4">
          <p className="mono mb-3 px-3 text-[10px] uppercase tracking-[.18em] text-[#8f9ab7]">Workspace</p>
          <nav className="space-y-1">
            <Link href="/" data-testid="link-create" className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${location === '/' ? 'bg-[var(--sidebar-ink-soft)] text-white' : 'text-[#aab3c9] hover:bg-[var(--sidebar-ink-soft)] hover:text-white'}`}>
              <Plus size={17} className={location === '/' ? 'text-[var(--amber)]' : ''} />
              Create a video
              {location === '/' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />}
            </Link>
            <Link href="/history" data-testid="link-history" className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${location === '/history' ? 'bg-[var(--sidebar-ink-soft)] text-white' : 'text-[#aab3c9] hover:bg-[var(--sidebar-ink-soft)] hover:text-white'}`}>
              <History size={17} className={location === '/history' ? 'text-[var(--amber)]' : ''} />
              Recent creations
            </Link>
          </nav>
        </div>
        <div className="mt-auto px-7 pb-7">
          <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-[.16em] text-[#8f9ab7]">Studio note</span>
              <Sparkles size={14} className="text-[var(--amber)]" />
            </div>
            <p className="text-[13px] leading-5 text-[#d4d8e3]">One sentence in. A complete point of view out.</p>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ef705b] text-xs font-bold text-[var(--ink)]">YC</span>
            <div>
              <p className="text-xs font-medium">Your creative desk</p>
              <p className="mono mt-0.5 text-[10px] text-[#8f9ab7]">Local workspace</p>
            </div>
            <MoreHorizontal size={17} className="ml-auto text-[#8f9ab7]" />
          </div>
        </div>
      </aside>
      {mobileNav && <button aria-label="Close menu overlay" onClick={() => setMobileNav(false)} className="fixed inset-0 z-30 bg-[var(--ink)]/40 md:hidden" data-testid="button-close-overlay" />}
      <main className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center justify-between border-b px-5 md:px-10" style={{ borderColor: 'var(--line)' }}>
          <button onClick={() => setMobileNav(true)} className="rounded-lg p-2 hover:bg-black/5 md:hidden" aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-xs text-[#697087] md:flex">
            <span className="mono text-[10px] uppercase tracking-[.16em]">FRAME / 15</span>
            <span className="text-[#b0aa9d]">/</span>
            <span>{location === '/history' ? 'Recent creations' : 'Create a video'}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-[#697087] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#7cb49a]" /> All systems ready</span>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-[#d7d0c4] bg-[#eee9df] text-xs font-bold" onClick={() => window.alert('Workspace settings are coming soon.')} aria-label="Open workspace settings" data-testid="button-workspace-settings">YC</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function LoadingFrame() {
  return (
    <div className="space-y-4" data-testid="loading-frame">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[#e4dfd4]" />
      <div className="h-[360px] animate-pulse rounded-[20px] bg-[#e4dfd4]" />
      <div className="h-20 animate-pulse rounded-2xl bg-[#e4dfd4]" />
    </div>
  );
}

function ScenePreview({ scene, index, active, onClick }: { scene: VideoScene; index: number; active: boolean; onClick: () => void }) {
  const accent = getAccent(scene.accent, index % 2 ? '#ef705b' : '#f6b849');
  return (
    <button onClick={onClick} className={`relative min-w-[120px] overflow-hidden rounded-xl border text-left transition-transform duration-200 hover:-translate-y-0.5 ${active ? 'border-[var(--amber)] shadow-[0_0_0_2px_rgba(246,184,73,.22)]' : 'border-white/10'}`} data-testid={`button-scene-${scene.id}`}>
      <div className="preview-film h-[74px] p-3" style={{ backgroundColor: accent }}>
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at ${35 + index * 20}% 35%, ${accent}, transparent 42%)` }} />
        <span className="mono relative text-[9px] text-white/70">{String(index + 1).padStart(2, '0')} / {scene.start.toFixed(1)}s</span>
        <div className="relative mt-2 h-1 w-8 rounded-full bg-white/70" />
      </div>
      <div className="bg-[#202a48] px-3 py-2 text-[10px] font-medium text-white">{scene.title}</div>
    </button>
  );
}

function EmptyPreview({ onExample }: { onExample: () => void }) {
  return (
    <div className="cinema-grid flex min-h-[390px] flex-col items-center justify-center rounded-[22px] border border-[#ded8cc] bg-[#ebe5d9] px-6 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--sidebar-ink)] text-[var(--amber)] shadow-[8px_8px_0_rgba(23,33,59,.09)]">
        <Film size={25} />
      </div>
      <p className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-[#8a8274]">Your canvas is waiting</p>
      <h2 className="max-w-sm text-2xl font-semibold tracking-[-.04em] text-[var(--ink)]">Give it a sentence with a point of view.</h2>
      <p className="mt-3 max-w-[330px] text-sm leading-5 text-[#7a746a]">Describe a launch, a story, or a feeling. FRAME will shape it into a 15-second cut.</p>
      <button onClick={onExample} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink)] underline decoration-[var(--amber)] decoration-2 underline-offset-4 hover:text-[#596079]" data-testid="button-use-example">Try an example <ArrowUpRight size={13} /></button>
    </div>
  );
}

function PreviewStage({ project }: { project: VideoProject }) {
  const [activeScene, setActiveScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const scene = project.scenes?.[activeScene];
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed((current) => current >= project.duration ? 0 : current + 0.1), 100);
    return () => window.clearInterval(timer);
  }, [playing, project.duration]);
  useEffect(() => {
    if (!scene) return;
    if (elapsed >= scene.end) setActiveScene((current) => Math.min(current + 1, project.scenes.length - 1));
  }, [elapsed, scene, project.scenes.length]);
  const ratioClass = project.aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[245px]' : project.aspectRatio === '1:1' ? 'aspect-square max-w-[350px]' : 'aspect-video';
  const copyPrompt = async () => {
    await navigator.clipboard?.writeText(project.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const exportVideo = async () => {
    if (exporting) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      window.alert('Video export is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setExporting(true);
    setPlaying(false);
    const canvas = document.createElement('canvas');
    if (project.aspectRatio === '9:16') {
      canvas.width = 540;
      canvas.height = 960;
    } else if (project.aspectRatio === '1:1') {
      canvas.width = 720;
      canvas.height = 720;
    } else {
      canvas.width = 960;
      canvas.height = 540;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      setExporting(false);
      return;
    }

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];
    const finished = new Promise<Blob>((resolve) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    const drawFrame = (seconds: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const progress = Math.min(1, seconds / project.duration);
      const sceneIndex = Math.min(
        project.scenes.length - 1,
        Math.floor(progress * project.scenes.length),
      );
      const frameScene = project.scenes[sceneIndex];
      const accent = getAccent(frameScene?.accent);
      const drift = Math.sin(progress * Math.PI * 4) * width * 0.08;
      const gradient = context.createLinearGradient(
        0,
        0,
        width + drift,
        height,
      );
      gradient.addColorStop(0, '#141d38');
      gradient.addColorStop(0.48, accent);
      gradient.addColorStop(1, '#10172d');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      context.globalAlpha = 0.24;
      context.fillStyle = '#ffffff';
      for (let index = 0; index < 8; index += 1) {
        context.beginPath();
        context.arc(
          width * (0.15 + index * 0.13) + drift,
          height * (0.18 + (index % 3) * 0.26),
          Math.max(width, height) * (0.04 + (index % 2) * 0.018),
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.globalAlpha = 1;
      context.fillStyle = 'rgba(9, 14, 29, .65)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#f6b849';
      context.fillRect(width * 0.07, height * 0.085, width * 0.16, height * 0.045);
      context.fillStyle = 'rgba(255,255,255,.72)';
      context.font = `500 ${Math.max(12, width * 0.016)}px monospace`;
      context.fillText('FRAME / 15', width * 0.07, height * 0.07);
      context.fillStyle = '#ffffff';
      context.font = `600 ${Math.max(22, width * 0.046)}px sans-serif`;
      const caption = frameScene?.caption || project.prompt;
      const words = caption.split(' ');
      const lines: string[] = [];
      let line = '';
      const maxWidth = width * 0.78;
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (context.measureText(testLine).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);
      lines.slice(0, 4).forEach((text, lineIndex) => {
        context.fillText(text, width * 0.07, height * 0.61 + lineIndex * height * 0.085);
      });
      context.fillStyle = 'rgba(255,255,255,.66)';
      context.font = `400 ${Math.max(10, width * 0.014)}px monospace`;
      context.fillText(
        `${project.style.toUpperCase()}  /  ${project.duration}.0 SEC`,
        width * 0.07,
        height * 0.9,
      );
      context.fillStyle = 'rgba(255,255,255,.28)';
      context.fillRect(0, height * 0.965, width, height * 0.008);
      context.fillStyle = '#f6b849';
      context.fillRect(0, height * 0.965, width * progress, height * 0.008);
    };

    recorder.start();
    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const render = (now: number) => {
        const seconds = Math.min(project.duration, (now - startedAt) / 1000);
        drawFrame(seconds);
        setElapsed(seconds);
        if (seconds >= project.duration) {
          window.setTimeout(resolve, 160);
          return;
        }
        window.requestAnimationFrame(render);
      };
      window.requestAnimationFrame(render);
    });
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    const blob = await finished;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'frame-15'}-15s.webm`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };
  const shareVideo = async () => {
    if (navigator.share) {
      await navigator.share({ title: project.title, text: project.prompt });
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
    window.alert('Studio link copied to your clipboard.');
  };
  return (
    <div className="studio-rise studio-rise-delay-1">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-[#8b8275]">Latest render</p>
          <h2 className="text-[25px] font-semibold tracking-[-.045em] text-[var(--ink)]">{project.title}</h2>
        </div>
        <div className="mono flex items-center gap-2 text-[10px] text-[#8b8275]"><span className="h-1.5 w-1.5 rounded-full bg-[#7cb49a]" /> {project.duration}s / {project.aspectRatio}</div>
      </div>
      <div className="relative overflow-hidden rounded-[22px] bg-[var(--sidebar-ink)] p-3 shadow-[0_18px_35px_rgba(23,33,59,.12)] sm:p-4">
        <div className={`${ratioClass} preview-film cinema-grid group relative mx-auto flex w-full flex-col justify-end overflow-hidden rounded-[14px]`} style={{ backgroundColor: getAccent(scene?.accent || '#f6b849') }}>
          <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at ${30 + activeScene * 16}% ${26 + activeScene * 8}%, ${getAccent(scene?.accent || '#f6b849')}, transparent 35%), linear-gradient(145deg, rgba(10,18,39,.15), rgba(10,18,39,.82))` }} />
          <div className="absolute left-5 top-5 flex items-center gap-2"><span className="rounded bg-[var(--amber)] px-2 py-1 mono text-[9px] font-medium text-[var(--ink)]">FRAME / 15</span><span className="rounded border border-white/20 bg-black/20 px-2 py-1 mono text-[9px] text-white/75">CUT {String(activeScene + 1).padStart(2, '0')}</span></div>
          <div className="relative p-5 sm:p-8">
            <p className="mono mb-3 max-w-[440px] text-[9px] uppercase tracking-[.22em] text-white/60">{scene?.visual || project.style}</p>
            <p className="max-w-[520px] text-xl font-medium leading-[1.05] tracking-[-.04em] text-white sm:text-3xl">{scene?.caption || project.prompt}</p>
            <div className="mt-5 flex items-center gap-3 text-[10px] text-white/60"><span className="h-px w-8 bg-[var(--amber)]" /> {project.style} / {project.duration}.0 sec</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"><div className="h-full bg-[var(--amber)] transition-[width] duration-100" style={{ width: `${Math.min(100, (elapsed / project.duration) * 100)}%` }} /></div>
        </div>
        <div className="mt-3 flex items-center gap-2 px-1">
          <button onClick={() => setPlaying((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--amber)] text-[var(--ink)] transition-transform hover:scale-105" aria-label={playing ? 'Pause preview' : 'Play preview'} data-testid="button-play-preview">{playing ? <span className="flex gap-0.5"><i className="h-3 w-0.5 bg-current" /><i className="h-3 w-0.5 bg-current" /></span> : <Play size={15} fill="currentColor" />}</button>
          <span className="mono text-[10px] text-white/45">{elapsed.toFixed(1)} / {project.duration.toFixed(1)}</span>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={copyPrompt} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Copy prompt" data-testid="button-copy-prompt">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
            <button onClick={exportVideo} disabled={exporting} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-50" aria-label={exporting ? 'Rendering video' : 'Download video'} data-testid="button-download-video">{exporting ? <LoaderCircle size={15} className="animate-spin" /> : <Download size={15} />}</button>
            <button onClick={shareVideo} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Share video" data-testid="button-share-video"><Share2 size={15} /></button>
          </div>
        </div>
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {(project.scenes || []).map((item, index) => <ScenePreview key={item.id} scene={item} index={index} active={activeScene === index} onClick={() => { setActiveScene(index); setElapsed(item.start); }} />)}
      </div>
      <div className="mt-4 flex items-start gap-3 rounded-xl border bg-[#eee9df]/70 px-4 py-3" style={{ borderColor: 'var(--line)' }}>
        <WandSparkles size={16} className="mt-0.5 shrink-0 text-[#b47c23]" />
        <p className="text-xs leading-5 text-[#6d675e]"><span className="font-semibold text-[var(--ink)]">The cut is ready.</span> Generated from your prompt with {project.scenes?.length || 0} scenes and a {project.style} grade.</p>
      </div>
    </div>
  );
}

function Composer({ onGenerated }: { onGenerated: (project: VideoProject) => void }) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [progress, setProgress] = useState(0);
  const [showStyles, setShowStyles] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const generateVideo = useGenerateVideo();
  useEffect(() => {
    if (!generateVideo.isPending) { setProgress(0); return; }
    setProgress(8);
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + 7, 91)), 340);
    return () => window.clearInterval(timer);
  }, [generateVideo.isPending]);
  const submit = () => {
    if (prompt.trim().length < 8) {
      setErrorMessage('Give the scene a little more to work with — at least 8 characters.');
      return;
    }
    setErrorMessage('');
    generateVideo.mutate({ data: { prompt: prompt.trim(), aspectRatio, style } }, {
      onSuccess: (project) => { setProgress(100); onGenerated(project); },
      onError: () => setErrorMessage('The render could not be started. Check your connection and try again.'),
    });
  };
  const example = 'A quiet morning ritual becomes a bright new beginning for an independent coffee roaster.';
  return (
    <section className="studio-rise studio-rise-delay-2 rounded-[22px] border bg-[#f8f5ee] p-5 shadow-[0_8px_22px_rgba(23,33,59,.04)] sm:p-6" style={{ borderColor: 'var(--line)' }}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-[#8b8275]">Director's prompt</p>
          <h2 className="text-xl font-semibold tracking-[-.035em]">What should we make?</h2>
        </div>
        <span className="rounded-full bg-[#e9e3d8] px-3 py-1 mono text-[10px] text-[#81796d]">15 SEC</span>
      </div>
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the moment, the mood, or the message..." rows={4} maxLength={500} className="w-full resize-none rounded-2xl border bg-[#f0ece3] px-4 py-4 text-[15px] leading-6 outline-none transition-colors placeholder:text-[#9d968b] focus:border-[#b8904d] focus:bg-[#f6f2ea]" data-testid="input-video-prompt" />
      <div className="mt-2 flex items-center justify-between">
        <button onClick={() => setPrompt(example)} className="text-left text-[11px] text-[#8b8275] underline decoration-[#c7a05e] underline-offset-4 hover:text-[var(--ink)]" data-testid="button-example-prompt">Need a starting point? Try this one.</button>
        <span className="mono text-[10px] text-[#a19a8f]">{prompt.length}/500</span>
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: 'var(--line)' }}>
        <div className="space-y-3">
          <div>
            <p className="mono mb-2 text-[9px] uppercase tracking-[.16em] text-[#9a9184]">Frame</p>
            <div className="flex gap-2">
              {ratioOptions.map((option) => <button key={option.value} onClick={() => setAspectRatio(option.value)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${aspectRatio === option.value ? 'border-[#b8904d] bg-[#f5e8c9] font-semibold text-[var(--ink)]' : 'border-[#ddd7cc] bg-[#f4f0e7] text-[#81796d] hover:bg-[#ebe5d9]'}`} data-testid={`button-ratio-${option.value.replace(':', '-')}`}><span className="text-[11px]">{option.icon}</span>{option.label}</button>)}
            </div>
          </div>
          <div className="relative">
            <p className="mono mb-2 text-[9px] uppercase tracking-[.16em] text-[#9a9184]">Direction</p>
            <button onClick={() => setShowStyles((value) => !value)} className="flex min-w-[188px] items-center justify-between rounded-lg border border-[#ddd7cc] bg-[#f4f0e7] px-3 py-2 text-left text-xs hover:bg-[#ebe5d9]" data-testid="button-style-menu"><span><span className="font-semibold">{styleOptions.find((item) => item.value === style)?.label}</span><span className="ml-2 text-[#938b80]">{styleOptions.find((item) => item.value === style)?.note}</span></span><ChevronDown size={14} /></button>
            {showStyles && <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 w-[245px] rounded-xl border bg-[#f8f5ee] p-1.5 shadow-[0_16px_32px_rgba(23,33,59,.14)]" style={{ borderColor: 'var(--line)' }}>{styleOptions.map((option) => <button key={option.value} onClick={() => { setStyle(option.value); setShowStyles(false); }} className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-[#eee9df] ${style === option.value ? 'bg-[#f5e8c9]' : ''}`} data-testid={`button-style-${option.value}`}><span className="block text-xs font-semibold">{option.label}</span><span className="block text-[10px] text-[#8f887c]">{option.note}</span></button>)}</div>}
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {errorMessage && <p className="max-w-[270px] text-right text-[11px] leading-4 text-[#b25343]" data-testid="status-generation-error">{errorMessage}</p>}
          <button onClick={submit} disabled={generateVideo.isPending} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--sidebar-ink)] px-5 py-3 text-sm font-semibold text-[#f7f1e3] shadow-[4px_4px_0_#d8c8a9] transition-transform hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#d8c8a9] disabled:cursor-wait disabled:opacity-80" data-testid="button-generate-video">
            {generateVideo.isPending ? <><LoaderCircle size={16} className="animate-spin" /> Building your cut</> : <><Sparkles size={16} className="text-[var(--amber)]" /> Generate video</>}
          </button>
        </div>
      </div>
      {generateVideo.isPending && <div className="mt-5 rounded-xl border bg-[#eee9df] p-3" style={{ borderColor: 'var(--line)' }} data-testid="status-generation-progress"><div className="mb-2 flex justify-between"><span className="mono text-[9px] uppercase tracking-[.16em] text-[#81796d]">Rendering your point of view</span><span className="mono text-[10px] text-[#81796d]">{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#d8d0c3]"><div className="relative h-full rounded-full bg-[var(--amber)] transition-[width] duration-300" style={{ width: `${progress}%` }}><span className="studio-scan absolute inset-y-0 left-0 w-1/3 bg-white/45" /></div></div><div className="mt-2 flex items-center gap-2 text-[10px] text-[#938b80]"><span className="studio-pulse h-1.5 w-1.5 rounded-full bg-[#b47c23]" /> Mapping scenes · shaping light · finding the cut</div></div>}
    </section>
  );
}

function RecentRail({ projects, onOpen }: { projects: VideoProject[]; onOpen: (project: VideoProject) => void }) {
  if (!projects.length) return <div className="studio-rise studio-rise-delay-3 rounded-2xl border border-dashed bg-[#eee9df]/50 p-5 text-center" style={{ borderColor: 'var(--line)' }}><Layers3 size={18} className="mx-auto mb-2 text-[#a49b8d]" /><p className="text-xs font-semibold">Your recent creations will land here.</p><p className="mt-1 text-[11px] text-[#91897d]">Make your first cut above, then revisit it anytime.</p></div>;
  return <section className="studio-rise studio-rise-delay-3"><div className="mb-3 flex items-center justify-between"><p className="mono text-[10px] uppercase tracking-[.2em] text-[#8b8275]">Recent creations</p><Link href="/history" className="text-[11px] font-semibold text-[#8c6727] hover:text-[var(--ink)]" data-testid="link-see-all-history">See all</Link></div><div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">{projects.slice(0, 5).map((project) => <button key={project.id} onClick={() => onOpen(project)} className="group min-w-[190px] rounded-xl border bg-[#f8f5ee] p-3 text-left transition-transform hover:-translate-y-0.5" style={{ borderColor: 'var(--line)' }} data-testid={`button-recent-${project.id}`}><div className="preview-film relative mb-3 flex h-[76px] items-end overflow-hidden rounded-lg p-2" style={{ backgroundColor: getAccent(project.scenes?.[0]?.accent) }}><span className="relative rounded bg-black/25 px-1.5 py-1 mono text-[8px] text-white">{project.aspectRatio}</span><span className="relative ml-auto rounded bg-[var(--amber)] px-1.5 py-1 mono text-[8px] text-[var(--ink)]">{project.duration}s</span></div><p className="line-clamp-1 text-xs font-semibold">{project.title}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#91897d]"><Clock3 size={11} /> {formatRelativeDate(project.createdAt)}</p></button>)}</div></section>;
}

function StudioPage() {
  const queryClient = useQueryClient();
  const listQuery = useListVideos({ query: { queryKey: getListVideosQueryKey() } });
  const projects = useMemo(() => Array.isArray(listQuery.data) ? listQuery.data : [], [listQuery.data]);
  const [selectedId, setSelectedId] = useState(() => window.sessionStorage.getItem('frame15-selected') || '');
  const [localProject, setLocalProject] = useState<VideoProject | null>(null);
  const selectedQuery = useGetVideo(selectedId, { query: { enabled: Boolean(selectedId), queryKey: getGetVideoQueryKey(selectedId) } });
  const previewProject = localProject || selectedQuery.data || projects[0];
  const openProject = (project: VideoProject) => {
    setLocalProject(project);
    setSelectedId(project.id);
    window.sessionStorage.setItem('frame15-selected', project.id);
  };
  const handleGenerated = (project: VideoProject) => {
    openProject(project);
    queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() });
  };
  return <StudioShell><div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10 md:py-10"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mono mb-3 text-[10px] uppercase tracking-[.22em] text-[#8b8275]">Creative workstation</p><h1 className="max-w-[690px] text-[clamp(2rem,4vw,3.45rem)] font-semibold leading-[.94] tracking-[-.065em]">Turn the thought in your head<br className="hidden sm:block" /> into something people can feel.</h1></div><p className="max-w-[225px] text-sm leading-5 text-[#777066]">A focused studio for 15-second stories, launches, and little moments that deserve a frame.</p></div><div className="grid gap-7 xl:grid-cols-[minmax(0,1.22fr)_minmax(370px,.78fr)]"><div className="min-w-0">{listQuery.isLoading ? <LoadingFrame /> : listQuery.isError ? <div className="rounded-2xl border bg-[#eee9df] p-6" style={{ borderColor: 'var(--line)' }}><RotateCcw size={18} className="mb-3 text-[#b25343]" /><p className="text-sm font-semibold">Could not load the studio.</p><p className="mt-1 text-xs text-[#81796d]">Your prompt box is still ready. Try refreshing the recent creations.</p><button onClick={() => listQuery.refetch()} className="mt-4 rounded-lg bg-[var(--sidebar-ink)] px-3 py-2 text-xs font-semibold text-white" data-testid="button-retry-videos">Retry</button></div> : previewProject ? <PreviewStage project={previewProject} /> : <EmptyPreview onExample={() => document.querySelector<HTMLTextAreaElement>('[data-testid=\"input-video-prompt\"]')?.focus()} />}</div><div className="space-y-7"><Composer onGenerated={handleGenerated} /><RecentRail projects={projects} onOpen={openProject} /></div></div></div></StudioShell>;
}

function HistoryPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const listQuery = useListVideos({ query: { queryKey: getListVideosQueryKey() } });
  const projects = useMemo(() => Array.isArray(listQuery.data) ? [...listQuery.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [], [listQuery.data]);
  const [notice, setNotice] = useState('');
  const openProject = (project: VideoProject) => {
    window.sessionStorage.setItem('frame15-selected', project.id);
    setNotice(project.title);
    setLocation('/');
  };
  return <StudioShell><div className="mx-auto max-w-[1350px] px-5 py-8 md:px-10 md:py-10"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mono mb-3 text-[10px] uppercase tracking-[.22em] text-[#8b8275]">Archive / {projects.length} cuts</p><h1 className="text-[clamp(2.1rem,4vw,3.5rem)] font-semibold leading-none tracking-[-.065em]">Recent creations</h1><p className="mt-3 max-w-[420px] text-sm leading-5 text-[#777066]">Every prompt, preserved as a small point of view. Reopen one to study the cut or make a new variation.</p></div><Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--sidebar-ink)] px-4 py-3 text-sm font-semibold text-[#f7f1e3] shadow-[4px_4px_0_#d8c8a9] hover:-translate-y-0.5" data-testid="link-new-video"><Plus size={16} className="text-[var(--amber)]" /> New video</Link></div>{notice && <p className="mb-5 rounded-lg bg-[#f5e8c9] px-3 py-2 text-xs text-[#795a25]" data-testid="status-reopening">Opening {notice}...</p>}{listQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="h-64 animate-pulse rounded-2xl bg-[#e4dfd4]" /><div className="h-64 animate-pulse rounded-2xl bg-[#e4dfd4]" /><div className="h-64 animate-pulse rounded-2xl bg-[#e4dfd4]" /></div> : listQuery.isError ? <div className="rounded-2xl border bg-[#eee9df] p-8 text-center" style={{ borderColor: 'var(--line)' }}><p className="text-sm font-semibold">The archive is taking a moment.</p><button onClick={() => { queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() }); listQuery.refetch(); }} className="mt-4 rounded-lg bg-[var(--sidebar-ink)] px-4 py-2 text-xs font-semibold text-white" data-testid="button-retry-history">Try again</button></div> : projects.length === 0 ? <div className="cinema-grid rounded-[22px] border border-dashed bg-[#eee9df]/70 px-6 py-20 text-center" style={{ borderColor: 'var(--line)' }}><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--sidebar-ink)] text-[var(--amber)]"><Film size={21} /></div><h2 className="text-xl font-semibold tracking-[-.03em]">No cuts in the archive yet.</h2><p className="mx-auto mt-2 max-w-[330px] text-sm leading-5 text-[#81796d]">Your first generated video will appear here, ready to revisit whenever the idea comes back.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold underline decoration-[var(--amber)] decoration-2 underline-offset-4" data-testid="link-empty-create">Start with a prompt <ArrowUpRight size={13} /></Link></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <button key={project.id} onClick={() => openProject(project)} className="group rounded-[18px] border bg-[#f8f5ee] p-3 text-left transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(23,33,59,.08)]" style={{ borderColor: 'var(--line)' }} data-testid={`button-history-${project.id}`}><div className="preview-film relative mb-4 flex aspect-[1.55] overflow-hidden rounded-xl p-3" style={{ backgroundColor: getAccent(project.scenes?.[0]?.accent) }}><div className="absolute inset-0 opacity-55" style={{ background: `radial-gradient(circle at 35% 30%, ${getAccent(project.scenes?.[0]?.accent)}, transparent 43%)` }} /><div className="relative flex w-full items-start justify-between"><span className="rounded bg-black/25 px-2 py-1 mono text-[9px] text-white">{project.style}</span><span className="rounded bg-[var(--amber)] px-2 py-1 mono text-[9px] text-[var(--ink)]">{project.duration}s</span></div><div className="relative mt-auto flex w-full items-end justify-between"><span className="max-w-[75%] text-lg font-medium leading-[1.03] tracking-[-.035em] text-white">{project.scenes?.[0]?.caption || project.title}</span><span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"><ArrowUpRight size={15} /></span></div></div><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{project.title}</h2><p className="mt-1 line-clamp-2 text-xs leading-4 text-[#81796d]">{project.prompt}</p></div><span className="mono shrink-0 text-[9px] uppercase tracking-[.12em] text-[#8f887c]">{project.aspectRatio}</span></div><div className="mt-4 flex items-center justify-between border-t pt-3 text-[10px] text-[#91897d]" style={{ borderColor: 'var(--line)' }}><span className="flex items-center gap-1"><Clock3 size={11} /> {formatRelativeDate(project.createdAt)}</span><span className="flex items-center gap-1 text-[#6d8e78]"><Check size={11} /> Ready</span></div></button>)}</div>}</div></StudioShell>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/history" component={HistoryPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}


function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
