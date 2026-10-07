"use client";

import { useEffect, useRef, useState } from "react";
import "./landing.css";
import { BasementScene } from "./BasementScene";
import { ThreeBriefcaseScene } from "./ThreeBriefcaseScene";
import { OfferLetter } from "./OfferLetter";
import { PromptButton, TerminalPrompt } from "./TerminalPrompt";
import { useLandingAudio } from "./useLandingAudio";

export interface LandingExperienceProps {
  /** Target URL for main dashboard (defaults to "#/war-room") */
  loginUrl?: string;
  /** Custom callback when the user accepts recruitment by clicking "[ Yes, I'm in ]" */
  onJoin?: () => void;
}

export function LandingExperience({
  loginUrl = "#/war-room",
  onJoin,
}: LandingExperienceProps = {}) {
  const audio = useLandingAudio();

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const docScrollRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);

  const [reduced, setReduced] = useState(false);
  const [connected, setConnected] = useState<null | "si" | "no">(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* ---- smooth continuous cinematic timeline, scrubbed by scroll ---- */
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, LenisMod] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      let lenis: InstanceType<typeof LenisMod.default> | null = null;
      let tickerCb: ((time: number) => void) | null = null;
      if (!prefersReduced) {
        lenis = new LenisMod.default({ duration: 1.1, smoothWheel: true });
        (window as any).__lenis = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        tickerCb = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(tickerCb);
        gsap.ticker.lagSmoothing(0);
      }

      const ctx = gsap.context(() => {
        const ease = "power2.inOut";
        const tl = gsap.timeline({
          defaults: { ease },
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: prefersReduced ? true : 1.0,
            onUpdate: (self) => {
              scrollProgressRef.current = self.progress;
            },
          },
        });

        // 0.00 – 0.14 · Hero Title "LA CASA DE ROZGAAR" fades out smoothly as scroll starts
        tl.fromTo(
          "[data-hero-title]",
          { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
          { opacity: 0, y: -45, scale: 0.94, filter: "blur(10px)", duration: 0.14 },
          0.0,
        )

        // 0.00 – 0.58 · Background room zooms in exact optical sync with 3D camera dollying toward the table
        .fromTo(
          "[data-room]",
          { scale: 1.0, filter: "brightness(1) blur(0px)", transformOrigin: "50% 55%" },
          { scale: 1.48, filter: "brightness(0.78) blur(3px)", duration: 0.58, ease: "power1.inOut" },
          0.0,
        )

          // 0.20 – 0.40 · CRT Connection Prompt appears as we approach the desk
          .fromTo(
            "[data-connect]",
            { opacity: 0, y: 35, pointerEvents: "none" },
            { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.1 },
            0.2,
          )
          .to(
            "[data-connect]",
            { opacity: 0, y: -20, pointerEvents: "none", duration: 0.08 },
            0.4,
          )

          // 0.64 – 0.76 · Document pops out directly from the centered top-down view to cover the viewport
          .fromTo(
            "[data-macro-container]",
            { opacity: 0, scale: 0.32, y: "0vh", rotateX: 0, pointerEvents: "none" },
            {
              opacity: 1,
              scale: 1,
              y: "0vh",
              rotateX: 0,
              pointerEvents: "auto",
              duration: 0.12,
              ease: "power2.out",
            },
            0.64,
          )
          .to(
            "[data-darken]",
            { opacity: 0.85, duration: 0.12 },
            0.64,
          )
          // Pad timeline to 1.00
          .to({}, { duration: 0.24 }, 0.76);

        // Ensure ScrollTrigger accurately calculates heights after initial DOM stabilization
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 300);
      }, stageRef);

      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", handleResize);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        if (tickerCb) {
          gsap.ticker.remove(tickerCb);
        }
        if (lenis) {
          lenis.destroy();
          delete (window as any).__lenis;
        }
        ctx.revert();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  /* ---- Silky Smooth Momentum Scrolling for Macro Document (starts only when fully covering screen) ---- */
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);

  useEffect(() => {
    const el = docScrollRef.current;
    if (!el) return;

    let animId = 0;

    const smoothLoop = () => {
      animId = requestAnimationFrame(smoothLoop);

      // Only scroll once document has fully expanded and covers the screen (progress >= 0.76)
      if (scrollProgressRef.current < 0.76) {
        targetScrollRef.current = 0;
        currentScrollRef.current = 0;
        if (el.scrollTop !== 0) el.scrollTop = 0;
        return;
      }

      const diff = targetScrollRef.current - currentScrollRef.current;
      if (Math.abs(diff) > 0.25) {
        // High-fidelity smooth lerp damping for zero-jitter, buttery inertia
        currentScrollRef.current += diff * 0.12;
        el.scrollTop = currentScrollRef.current;
      } else if (currentScrollRef.current !== targetScrollRef.current) {
        currentScrollRef.current = targetScrollRef.current;
        el.scrollTop = currentScrollRef.current;
      }
    };
    animId = requestAnimationFrame(smoothLoop);

    const handleWheel = (e: WheelEvent) => {
      // Document only scrolls once it fully covers the screen (progress >= 0.76)
      if (scrollProgressRef.current < 0.76) return;

      const { scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      // Scrolling down inside full-screen document
      if (e.deltaY > 0 && targetScrollRef.current < maxScroll) {
        e.preventDefault();
        e.stopPropagation();
        targetScrollRef.current = Math.min(
          maxScroll,
          targetScrollRef.current + e.deltaY * 0.9,
        );
      }
      // Scrolling up inside full-screen document
      else if (e.deltaY < 0 && targetScrollRef.current > 0) {
        e.preventDefault();
        e.stopPropagation();
        targetScrollRef.current = Math.max(
          0,
          targetScrollRef.current + e.deltaY * 0.9,
        );
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const answerConnect = (choice: "si" | "no") => {
    if (choice === "si") audio.start();
    setConnected(choice);
  };

  const enterHeist = () => {
    audio.fadeOut();
    setLeaving(true);
    if (onJoin) {
      window.setTimeout(() => onJoin(), 600);
    } else {
      window.setTimeout(() => {
        window.location.href = loginUrl;
      }, 600);
    }
  };

  const returnToTable = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(0.32 * max, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0.32 * max, behavior: "smooth" });
    }
  };

  return (
    <div ref={wrapRef} className="relative h-[650vh] bg-background">
      {/* The single continuous scene */}
      <div
        ref={stageRef}
        className="grain vignette fixed inset-0 overflow-hidden"
      >
        <BasementScene reducedMotion={reduced} />

        {/* 3D WebGL Planning Table + 3D Suitcase + CRT Terminal */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <ThreeBriefcaseScene
            scrollProgressRef={scrollProgressRef}
            connectedState={connected}
            onCaseClick={() => {
              if (!connected) {
                answerConnect("si");
              }
            }}
          />
        </div>

        <div
          data-darken
          className="pointer-events-none absolute inset-0 z-[15] bg-[#0d0b0b] opacity-0"
        />

        {/* DEFAULT VIEW AT SCROLL = 0: "LA CASA DE ROZGAAR" + "Scroll to inspect" */}
        <div
          data-hero-title
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase font-black leading-[0.9] drop-shadow-[0_6px_36px_rgba(201,24,43,0.55)]">
            LA CASA DE <span className="text-crimson">ROZGAAR</span>
          </h1>

          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2 text-center animate-pulse">
            <span className="font-mono text-xs sm:text-sm tracking-[0.3em] text-[#e0bfa0] uppercase font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Scroll to inspect
            </span>
            <span className="text-crimson font-mono text-base font-bold animate-bounce">
              ↓
            </span>
          </div>
        </div>

        {/* The Professor CRT Connection Prompt (All in English except 'Si') */}
        <div
          data-connect
          className={`absolute inset-x-0 bottom-[10vh] z-30 flex justify-center opacity-0 pointer-events-none ${
            connected ? "pointer-events-none" : ""
          }`}
        >
          <TerminalPrompt
            label="ENCRYPTED COMMUNICATION · DIRECT LINK"
            title="Connect to Professor?"
          >
            {connected ? (
              <p className="font-mono text-[12px] tracking-widest text-crimson font-bold uppercase">
                {connected === "si"
                  ? "SECURE LINK ACTIVE (148.50 MHz) — PROFESSOR CONNECTED"
                  : "RADIO SILENCE MAINTAINED — STANDALONE DOSSIER MODE"}
              </p>
            ) : (
              <div className="flex gap-4">
                <PromptButton tone="crimson" onClick={() => answerConnect("si")}>
                  [ SI ] — I'm in
                </PromptButton>
                <PromptButton onClick={() => answerConnect("no")}>
                  [ NO ] — Radio Silence
                </PromptButton>
              </div>
            )}
          </TerminalPrompt>
        </div>

        {/* Macro Offer Letter: Takes over the entire page and stays full-screen */}
        <div
          data-macro-container
          className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center p-2 sm:p-5 md:p-8 opacity-0 will-change-transform"
          style={{ perspective: "1400px" }}
        >
          <div className="h-[min(92vh,840px)] w-[min(96vw,1080px)] pointer-events-auto">
            <OfferLetter
              variant="macro"
              scrollRef={docScrollRef}
              onJoin={enterHeist}
              onNotYet={returnToTable}
            />
          </div>
        </div>

        {/* Unobtrusive audio control, only once music exists */}
        {connected === "si" && audio.available && (
          <button
            type="button"
            onClick={audio.toggle}
            className="absolute bottom-5 right-5 z-40 cursor-pointer font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            {audio.playing ? "SOUND ON" : "SOUND OFF"}
          </button>
        )}

        {/* Crimson wipe into /login */}
        <div
          className="pointer-events-none absolute inset-0 z-50 origin-bottom transition-transform duration-[700ms] ease-[cubic-bezier(0.7,0,0.2,1)]"
          style={{
            background:
              "linear-gradient(0deg, oklch(0.32 0.14 22), oklch(0.08 0.02 20))",
            transform: leaving ? "scaleY(1)" : "scaleY(0)",
          }}
        />
      </div>
    </div>
  );
}
