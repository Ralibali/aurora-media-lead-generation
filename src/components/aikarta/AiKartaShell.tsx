import { ReactNode } from "react";
import { VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";

const AiKartaShell = ({ children }: { children: ReactNode }) => (
  <div className="verkstad">
    <VkNav />
    <main id="main">{children}</main>
    <VkFooter />
  </div>
);

export default AiKartaShell;
