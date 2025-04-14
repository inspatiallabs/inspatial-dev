/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { kit } from "@inspatial/theme/variant";
import { SharedProps } from "@inspatial/type/util";
import React from "react";

interface MarqueeProps extends SharedProps {
  direction?: "left" | "right";
  speed?: "slow" | "very-slow" | "ultra-slow" | "normal" | "fast";
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [start, setStart] = React.useState(false);
  const [currentSpeed, setCurrentSpeed] = React.useState(speed);

  React.useEffect(() => {
    // Set initial speed to normal
    setCurrentSpeed("normal");

    // Add a small delay to ensure the normal speed is applied
    const timer = setTimeout(() => {
      addAnimation();
      setCurrentSpeed(speed);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const speedSettings = {
        fast: "20s",
        normal: "40s",
        slow: "60s",
        "very-slow": "80s",
        "ultra-slow": "100s",
      };
      containerRef.current.style.setProperty(
        "--animation-duration",
        speedSettings[currentSpeed] || speedSettings.normal
      );
    }
  };

  return (
    <main
      ref={containerRef}
      className={kit(
        "scroller relative overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <section
        ref={scrollerRef}
        className={kit(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        <div className="flex shrink-0 gap-4 py-4">
          {children as React.ReactNode}
        </div>
      </section>
    </main>
  );
}
