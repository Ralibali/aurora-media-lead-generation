/* Original collage-style props for the AURORA.md homepage film.
   Hand-built SVG: flat colour, soft paper grain from the parent and a
   contact shadow, so each object reads like a cut-out placed in a set. */

type P = { className?: string };

export const SunMark = ({ className }: P) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="31" fill="#f3eadb" />
    <path d="M12 40a20 20 0 0 1 40 0Z" fill="#ff4d17" />
    {[-60, -30, 0, 30, 60].map((a) => (
      <rect key={a} x="30.5" y="8" width="3" height="9" rx="1.5" fill="#1d1b1c" transform={`rotate(${a} 32 40)`} />
    ))}
    <rect x="10" y="40" width="44" height="3.5" rx="1.75" fill="#1d1b1c" />
    <rect x="18" y="47" width="28" height="3" rx="1.5" fill="#1d1b1c" opacity=".55" />
  </svg>
);

/* Hero: a leaning tower of office binders — the manual work. */
export const Binders = ({ className }: P) => (
  <svg className={className} viewBox="0 0 260 340" aria-hidden="true">
    <ellipse cx="130" cy="328" rx="118" ry="10" fill="#000" opacity=".18" />
    {[
      { x: 18, c: "#ff4d17", r: -4 },
      { x: 66, c: "#f6c945", r: -2 },
      { x: 112, c: "#2f5d3a", r: 0 },
      { x: 158, c: "#f3a6c8", r: 3 },
      { x: 206, c: "#1d1b1c", r: 7 },
    ].map((b, i) => (
      <g key={i} transform={`rotate(${b.r} ${b.x + 22} 320)`}>
        <rect x={b.x} y={60 + i * 4} width="44" height={262 - i * 4} rx="4" fill={b.c} />
        <rect x={b.x + 8} y={92 + i * 4} width="28" height="54" rx="3" fill="#f3eadb" />
        <rect x={b.x + 13} y={104 + i * 4} width="18" height="3" fill="#1d1b1c" opacity=".6" />
        <rect x={b.x + 13} y={113 + i * 4} width="12" height="3" fill="#1d1b1c" opacity=".4" />
        <circle cx={b.x + 22} cy={250} r="9" fill="#f3eadb" opacity=".9" />
        <circle cx={b.x + 22} cy={250} r="4" fill={b.c} />
        <rect x={b.x} y={60 + i * 4} width="7" height={262 - i * 4} fill="#000" opacity=".12" />
      </g>
    ))}
  </svg>
);

/* Hero: an old rotary phone on a stool — the customer calls nobody has time for. */
export const PhoneStool = ({ className }: P) => (
  <svg className={className} viewBox="0 0 260 360" aria-hidden="true">
    <ellipse cx="130" cy="350" rx="105" ry="9" fill="#000" opacity=".2" />
    <path d="M58 172 40 348h18l26-176ZM202 172l18 176h-18l-26-176Z" fill="#b07a45" />
    <path d="M100 172 92 348h14l12-176ZM160 172l8 176h-14l-12-176Z" fill="#8f5f33" />
    <rect x="40" y="160" width="180" height="22" rx="11" fill="#d9a066" />
    <rect x="40" y="172" width="180" height="10" rx="5" fill="#000" opacity=".1" />
    <path d="M70 160c4-38 30-58 60-58s56 20 60 58Z" fill="#ff4d17" />
    <path d="M62 92c0-20 30-30 68-30s68 10 68 30c0 10-12 14-22 12l-10-14c-12-4-24-5-36-5s-24 1-36 5l-10 14c-10 2-22-2-22-12Z" fill="#e03d0d" />
    <circle cx="130" cy="126" r="26" fill="#f3eadb" />
    {[0, 40, 80, 120, 160, 200, 240, 280].map((a) => (
      <circle key={a} cx={130 + 17 * Math.cos((a * Math.PI) / 180)} cy={126 + 17 * Math.sin((a * Math.PI) / 180)} r="4" fill="#1d1b1c" />
    ))}
    <circle cx="130" cy="126" r="6" fill="#ff4d17" />
    <path d="M190 140c30 10 20 40 40 50" fill="none" stroke="#1d1b1c" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
  </svg>
);

/* Hero: a small tin robot carrying a single sheet of paper. */
export const TinRobot = ({ className }: P) => (
  <svg className={className} viewBox="0 0 200 330" aria-hidden="true">
    <ellipse cx="100" cy="320" rx="64" ry="8" fill="#000" opacity=".22" />
    <rect x="96" y="18" width="8" height="30" fill="#1d1b1c" />
    <circle cx="100" cy="16" r="9" fill="#ff4d17" />
    <rect x="52" y="46" width="96" height="74" rx="18" fill="#c9cdd2" />
    <rect x="52" y="46" width="96" height="20" rx="10" fill="#fff" opacity=".35" />
    <circle cx="80" cy="84" r="12" fill="#1d1b1c" /><circle cx="120" cy="84" r="12" fill="#1d1b1c" />
    <circle cx="83" cy="81" r="4" fill="#f6c945" /><circle cx="123" cy="81" r="4" fill="#f6c945" />
    <rect x="84" y="104" width="32" height="5" rx="2.5" fill="#1d1b1c" opacity=".6" />
    <rect x="44" y="128" width="112" height="112" rx="16" fill="#aeb4bb" />
    <rect x="62" y="146" width="76" height="40" rx="6" fill="#1d1b1c" />
    <rect x="70" y="156" width="40" height="5" rx="2.5" fill="#6ee7a8" /><rect x="70" y="168" width="56" height="5" rx="2.5" fill="#6ee7a8" opacity=".6" />
    <circle cx="74" cy="210" r="8" fill="#ff4d17" /><circle cx="100" cy="210" r="8" fill="#f6c945" /><circle cx="126" cy="210" r="8" fill="#2f5d3a" />
    <rect x="58" y="240" width="26" height="74" rx="8" fill="#8d949c" /><rect x="116" y="240" width="26" height="74" rx="8" fill="#8d949c" />
    <rect x="50" y="304" width="40" height="14" rx="7" fill="#1d1b1c" /><rect x="110" y="304" width="40" height="14" rx="7" fill="#1d1b1c" />
    <rect x="18" y="140" width="22" height="70" rx="11" fill="#8d949c" transform="rotate(-24 29 140)" />
    <rect x="160" y="140" width="22" height="70" rx="11" fill="#8d949c" transform="rotate(30 171 140)" />
    <g transform="rotate(-12 190 110)"><rect x="150" y="64" width="62" height="80" rx="3" fill="#f3eadb" /><rect x="160" y="78" width="40" height="4" fill="#1d1b1c" opacity=".5" /><rect x="160" y="90" width="30" height="4" fill="#1d1b1c" opacity=".35" /><rect x="160" y="102" width="36" height="4" fill="#1d1b1c" opacity=".35" /><path d="m176 120 6 7 14-15" fill="none" stroke="#ff4d17" strokeWidth="4" strokeLinecap="round" /></g>
  </svg>
);

export const Paper = ({ className, tone = "#f3eadb" }: P & { tone?: string }) => (
  <svg className={className} viewBox="0 0 120 150" aria-hidden="true">
    <path d="M6 4h82l26 26v116H6Z" fill={tone} />
    <path d="M88 4v26h26Z" fill="#000" opacity=".12" />
    {[44, 60, 76, 92, 108].map((y, i) => <rect key={y} x="20" y={y} width={i % 2 ? 60 : 78} height="5" rx="2.5" fill="#1d1b1c" opacity=".32" />)}
  </svg>
);

export const Envelope = ({ className }: P) => (
  <svg className={className} viewBox="0 0 160 110" aria-hidden="true">
    <rect x="4" y="6" width="152" height="98" rx="6" fill="#f3eadb" />
    <path d="m4 12 76 52 76-52" fill="none" stroke="#d6c7ae" strokeWidth="6" />
    <circle cx="132" cy="28" r="12" fill="#ff4d17" />
  </svg>
);

export const Gear = ({ className, tone = "#f6c945" }: P & { tone?: string }) => (
  <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
    <g fill={tone}>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x="52" y="2" width="16" height="24" rx="3" transform={`rotate(${i * 36} 60 60)`} />)}
      <circle cx="60" cy="60" r="40" />
    </g>
    <circle cx="60" cy="60" r="14" fill="#1d1b1c" opacity=".85" />
  </svg>
);

export const Clock = ({ className }: P) => (
  <svg className={className} viewBox="0 0 140 140" aria-hidden="true">
    <circle cx="70" cy="70" r="66" fill="#1d1b1c" />
    <circle cx="70" cy="70" r="56" fill="#f3eadb" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x="68" y="18" width="4" height="10" rx="2" fill="#1d1b1c" transform={`rotate(${i * 30} 70 70)`} />)}
    <rect x="67" y="36" width="6" height="38" rx="3" fill="#1d1b1c" />
    <rect x="67" y="66" width="5" height="34" rx="2.5" fill="#ff4d17" transform="rotate(118 70 70)" />
    <circle cx="70" cy="70" r="6" fill="#ff4d17" />
  </svg>
);

export const Plug = ({ className }: P) => (
  <svg className={className} viewBox="0 0 220 120" aria-hidden="true">
    <path d="M0 60h60" stroke="#1d1b1c" strokeWidth="10" strokeLinecap="round" />
    <rect x="56" y="34" width="50" height="52" rx="12" fill="#f3eadb" />
    <rect x="104" y="44" width="22" height="8" rx="3" fill="#c9cdd2" /><rect x="104" y="68" width="22" height="8" rx="3" fill="#c9cdd2" />
    <rect x="132" y="28" width="56" height="64" rx="14" fill="#ff4d17" />
    <circle cx="152" cy="50" r="4" fill="#1d1b1c" /><circle cx="152" cy="72" r="4" fill="#1d1b1c" />
    <path d="M188 60h32" stroke="#1d1b1c" strokeWidth="10" strokeLinecap="round" />
  </svg>
);

export const Stamp = ({ className }: P) => (
  <svg className={className} viewBox="0 0 160 200" aria-hidden="true">
    <ellipse cx="80" cy="190" rx="62" ry="7" fill="#000" opacity=".2" />
    <circle cx="80" cy="34" r="28" fill="#b07a45" />
    <rect x="68" y="56" width="24" height="60" rx="6" fill="#8f5f33" />
    <rect x="24" y="112" width="112" height="42" rx="8" fill="#1d1b1c" />
    <rect x="18" y="152" width="124" height="30" rx="5" fill="#ff4d17" />
    <path d="m58 166 14 10 30-20" fill="none" stroke="#f3eadb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 -4)" />
  </svg>
);

export const Key = ({ className }: P) => (
  <svg className={className} viewBox="0 0 240 110" aria-hidden="true">
    <circle cx="52" cy="55" r="46" fill="#f6c945" />
    <circle cx="52" cy="55" r="18" fill="none" stroke="#1d1b1c" strokeWidth="0" />
    <circle cx="44" cy="55" r="14" fill="#2f5d3a" />
    <rect x="92" y="46" width="140" height="18" rx="5" fill="#f6c945" />
    <rect x="186" y="62" width="14" height="24" rx="3" fill="#f6c945" /><rect x="210" y="62" width="14" height="32" rx="3" fill="#f6c945" />
    <rect x="92" y="46" width="140" height="6" rx="3" fill="#fff" opacity=".35" />
  </svg>
);

export const Ruler = ({ className }: P) => (
  <svg className={className} viewBox="0 0 300 70" aria-hidden="true">
    <rect x="2" y="6" width="296" height="58" rx="6" fill="#f6c945" />
    {Array.from({ length: 29 }, (_, i) => <rect key={i} x={14 + i * 10} y="6" width="3" height={i % 5 === 0 ? 26 : 14} fill="#1d1b1c" />)}
  </svg>
);

export const Hammer = ({ className }: P) => (
  <svg className={className} viewBox="0 0 220 260" aria-hidden="true">
    <ellipse cx="110" cy="250" rx="80" ry="7" fill="#000" opacity=".2" />
    <rect x="98" y="70" width="26" height="176" rx="10" fill="#d9a066" transform="rotate(-8 111 158)" />
    <path d="M40 34h120c14 0 24 10 24 24v18H40c-12 0-20-8-20-20s8-22 20-22Z" fill="#454b52" transform="rotate(-8 110 55)" />
    <path d="M184 52c14-8 26-6 32 2l-30 22Z" fill="#454b52" transform="rotate(-8 110 55)" />
  </svg>
);

export const Lightbulb = ({ className }: P) => (
  <svg className={className} viewBox="0 0 120 180" aria-hidden="true">
    <circle cx="60" cy="62" r="54" fill="#f6c945" opacity=".25" />
    <path d="M60 14a44 44 0 0 0-26 79c6 5 8 11 8 18v8h36v-8c0-7 2-13 8-18a44 44 0 0 0-26-79Z" fill="#fff6d8" />
    <path d="M50 120V84l10 10 10-10v36" fill="none" stroke="#ff4d17" strokeWidth="4" strokeLinejoin="round" />
    <rect x="42" y="120" width="36" height="12" rx="3" fill="#aeb4bb" /><rect x="44" y="134" width="32" height="10" rx="3" fill="#8d949c" /><rect x="50" y="146" width="20" height="10" rx="5" fill="#454b52" />
  </svg>
);
