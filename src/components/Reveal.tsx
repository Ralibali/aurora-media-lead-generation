import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "header" | "article" | "li";
} & Omit<HTMLMotionProps<"div">, "children">;

/**
 * Scroll-triggered reveal: fade + lift + optional blur.
 * Uses the project's signature cubic-bezier and respects prefers-reduced-motion.
 */
const Reveal = ({
  children,
  delay = 0,
  y = 24,
  blur = true,
  duration = 0.8,
  className,
  as = "div",
  ...rest
}: RevealProps) => {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;

  if (reduce) {
    return <Comp className={className}>{children}</Comp>;
  }

  return (
    <Comp
      initial={{
        opacity: 0,
        y,
        filter: blur ? "blur(8px)" : "blur(0px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export default Reveal;
