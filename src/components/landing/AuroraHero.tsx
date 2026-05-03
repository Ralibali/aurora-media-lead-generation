import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Code2, Rocket, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import "@/styles/lumina.css";

const TRUST = [
  { icon: Rocket, text: "SaaS, appar och digitala produkter från idé till lansering" },
  { icon: Bot, text: "AI, automation och effektivisering för företag" },
  { icon: Target, text: "Byggt för affärsnytta, tillväxt och smartare arbetsflöden" },
];

const OFFERINGS = [
  "SaaS & MVP",
  "AI-automation",
  "React Native-appar",
  "Interna system",
  "AI-genomlysning",
  "Säljautomation",
  "CRM-flöden",
  "Dashboards",
  "Webbappar",
  "SEO",
  "Google Ads",
  "Content",
];

const BrandMark = ({ name }: { name: string }) => (
  <span className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
    <span className="grid h-[15px] w-[15px] place-items-center rounded-full border border-white/35 bg-white/10 text-[7px] leading-none">
      {name.slice(0, 1)}
    </span>
    {name}
  </span>
);

const AuroraHero = () => {
  const { open } = useContactModal();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isRestartingRef = useRef(false);
  const [videoVisible, setVideoVisible] = useState(true);

  const restartVideoSoftly = () => {
    const video = videoRef.current;
    if (!video || isRestartingRef.current) return;

    isRestartingRef.current = true;
    setVideoVisible(false);

    window.setTimeout(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = 0.15;
      void videoRef.current.play();

      window.setTimeout(() => {
        setVideoVisible(true);
        isRestartingRef.current = false;
      }, 90);
    }, 420);
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    if (video.duration - video.currentTime <= 0.65) {
      restartVideoSoftly();
    }
  };

  return (
    <section id="top" className="lumina-hero relative min-h-screen overflow-hidden bg-black pt-[92px] text-white">
      <video
        ref={videoRef}
        className={`lumina-hero-video absolute inset-y-0 right-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoVisible ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={restartVideoSoftly}
      >
        <source
          src="https://cdn.sceneai.art/Hero%20Section%20Video/9ad5cc99-2fa4-4154-bcc2-5c9ec152778e.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,0.86)_32%,rgba(0,0,0,0)_86%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_82%_42%,rgba(168,85,247,0.14),transparent_36%)]" />

      <div className="relative z-10 flex min-h-[calc(100vh-92px)] items-center px-6 pb-44 pt-10 sm:px-10 lg:px-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="w-full -translate-y-[10%]"
        >
          <p className="mb-3 font-mono-au text-[9px] font-bold uppercase tracking-[0.4em] text-white/70">
            AURORA MEDIA · SAAS · AI · AUTOMATION · APPAR
          </p>

          <h1 className="font-display text-[clamp(3.4rem,8vw,6.2rem)] font-bold leading-[0.94] tracking-tight text-white md:max-w-[980px]">
            <span className="block">IDÉN FINNS.</span>
            <span className="block">VI BYGGER SYSTEMET.</span>
          </h1>

          <p className="mt-5 max-w-[650px] text-base font-normal leading-relaxed text-white/64 md:text-lg">
            Aurora Media bygger SaaS, appar, AI-lösningar och skräddarsydda system för företag som vill växa snabbare, effektivisera arbetet och ersätta manuella rutiner med smarta digitala flöden.
          </p>

          <div className="mt-[30px] flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={() => open()} className="lumina-primary-cta group">
              <span className="relative z-10 flex items-center gap-3">
                Boka kostnadsfri rådgivning
                <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-[5px]" />
              </span>
            </button>
            <Link
              to="/ai-automation-foretag"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-[26.5px] py-[14px] text-[12px] font-bold uppercase tracking-[0.08em] text-white/75 backdrop-blur-xl transition hover:border-white/35 hover:text-white"
            >
              AI & effektivisering
            </Link>
          </div>

          <ul className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-white/70">
                <span className="grid h-7 w-7 place-items-center rounded-md border border-blue-400/30 bg-blue-500/10 text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.22)]">
                  <Icon size={14} strokeWidth={2.2} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 sm:px-10 lg:px-[70px]">
        <p className="mb-5 text-center font-mono-au text-[9px] font-bold uppercase tracking-[0.6em] text-white/25">
          AURORA MEDIA ECOSYSTEM
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="lumina-ticker flex w-max gap-12 opacity-55 grayscale">
            {[...OFFERINGS, ...OFFERINGS].map((name, index) => (
              <BrandMark key={`${name}-${index}`} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuroraHero;
