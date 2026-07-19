import { ReactNode } from "react";
import { VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";

const AiKartaShell = ({ children }: { children: ReactNode }) => (
  <div className="verkstad">
    <a
      href="#main"
      className="vk-btn vk-btn-primary"
      style={{ position: "absolute", left: -9999, top: 8, zIndex: 100 }}
      onFocus={(e) => { e.currentTarget.style.left = "8px"; }}
      onBlur={(e) => { e.currentTarget.style.left = "-9999px"; }}
    >
      Hoppa till innehåll
    </a>
    <VkNav />
    <main id="main">{children}</main>
    <VkFooter />
  </div>
);

export default AiKartaShell;
