"use client";
import React from "react";
import { AnimatePresence, motion, useInView, Variants } from "motion/react";
import { kit } from "@inspatial/theme/variant";
import { SharedProps } from "@inspatial/type/util";
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   ChevronUpIcon,
//   ChevronDownIcon,
// } from "lucide-react";

/*################################ (TYPES) ###############################*/
type AnimationTypes =
  | "blurFade"
  | "linear"
  | "scale"
  | "rotate"
  | "bounce"
  | "spin"
  | "liquid";

interface ScrollIndicatorState {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

interface ScrollViewProps
  extends React.ComponentPropsWithRef<"div">,
    SharedProps {
  style?: React.CSSProperties;
  animate?: AnimationTypes;
  duration?: number;
  delay?: number;
  yOffset?: number;
  /**
   * If true, the animation will only play once when the component is in view i.e when the user scrolls to the component
   */
  inView?: boolean;
  inViewMargin?: string;
  /**
   * If true (default), the presentation window will retain its primitive scroll functionality, if false, the presentation window will not be scrollable
   */
  scrollable?: boolean;
  /**
   * If true, the scrollbar will be visible, if false, the scrollbar will not be visible
   */
  scrollbar?: boolean;
  /**
   * If true, the component will not wrap children in with base animation features, useful for interactive elements e.g draggable columns etc...
   */
  preserveChildren?: boolean;
}

/*################################ (ANIMATION VARIANTS) ###############################*/
const animationVariants: Record<AnimationTypes, Variants> = {
  blurFade: {
    hidden: { y: 20, opacity: 0, filter: "blur(6px)" },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  },
  linear: {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  scale: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  rotate: {
    hidden: { rotate: -10, opacity: 0 },
    visible: { rotate: 0, opacity: 1 },
  },
  bounce: {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  },
  spin: {
    hidden: { rotate: -180, opacity: 0 },
    visible: { rotate: 0, opacity: 1 },
  },
  liquid: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
  },
};

/*################################ (SCROLL INDICATOR COMPONENTS) ###############################*/
interface ScrollIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollAmount?: number;
  size?: string;
  background?: string;
  iconSize?: string;
  position?: string;
  show?: boolean;
}

export const ScrollViewIndicatorLeft = ({
  scrollAmount = 200,
  size = "w-8 h-8",
  background = "bg-primary hover:bg-brand text-surface cursor-pointer",
  iconSize = "w-5 h-5",
  position = "2",
  show = true,
  className,
  ...props
}: ScrollIndicatorProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={kit(
          `absolute z-10 flex items-center justify-center ${size} ${background} rounded-full shadow-md cursor-pointer transition-all duration-200`,
          `left-${position} top-1/2 -translate-y-1/2`,
          className
        )}
        {...(props as any)}
      >
        <>{`<`}</>
        {/* <ChevronLeftIcon className={iconSize} /> */}
      </motion.div>
    )}
  </AnimatePresence>
);

export const ScrollViewIndicatorRight = ({
  scrollAmount = 200,
  size = "w-8 h-8",
  background = "bg-primary hover:bg-brand text-surface cursor-pointer",
  iconSize = "w-5 h-5",
  position = "2",
  show = false,
  className,
  ...props
}: ScrollIndicatorProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={kit(
          `absolute z-10 flex items-center justify-center ${size} ${background} rounded-full shadow-md cursor-pointer transition-all duration-200`,
          `right-${position} top-1/2 -translate-y-1/2`,
          className
        )}
        {...(props as any)}
      >
        <>{`>`}</>
        {/* <ChevronRightIcon className={iconSize} /> */}
      </motion.div>
    )}
  </AnimatePresence>
);

const ScrollViewIndicatorTop = ({
  scrollAmount = 200,
  size = "w-8 h-8",
  background = "bg-primary hover:bg-brand text-surface cursor-pointer",
  iconSize = "w-5 h-5",
  position = "2",
  show = false,
  className,
  ...props
}: ScrollIndicatorProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={kit(
          `absolute z-10 flex items-center justify-center ${size} ${background} rounded-full shadow-md cursor-pointer transition-all duration-200`,
          `top-${position} left-1/2 -translate-x-1/2`,
          className
        )}
        {...(props as any)}
      >
        <>{`^`}</>
        {/* <ChevronUpIcon className={iconSize} /> */}
      </motion.div>
    )}
  </AnimatePresence>
);

const ScrollViewIndicatorBottom = ({
  scrollAmount = 200,
  size = "w-8 h-8",
  background = "bg-primary hover:bg-brand text-surface cursor-pointer",
  iconSize = "w-5 h-5",
  position = "2",
  show = false,
  className,
  ...props
}: ScrollIndicatorProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={kit(
          `absolute z-10 flex items-center justify-center ${size} ${background} rounded-full shadow-md cursor-pointer transition-all duration-200`,
          `bottom-${position} left-1/2 -translate-x-1/2`,
          className
        )}
        {...(props as any)}
      >
        <>{`v`}</>
        {/* <ChevronDownIcon className={iconSize} /> */}
      </motion.div>
    )}
  </AnimatePresence>
);

ScrollViewIndicatorBottom.displayName = "ScrollViewIndicatorBottom";
ScrollViewIndicatorLeft.displayName = "ScrollViewIndicatorLeft";
ScrollViewIndicatorRight.displayName = "ScrollViewIndicatorRight";
ScrollViewIndicatorTop.displayName = "ScrollViewIndicatorTop";

/*################################ (SCROLL AREA COMPONENTS) ###############################*/
interface ScrollAreaProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = React.useState<ScrollIndicatorState>({
      left: false,
      right: false,
      top: false,
      bottom: false,
    });

    const updateScrollState = () => {
      if (!scrollRef.current) return;

      const {
        scrollLeft,
        scrollTop,
        scrollWidth,
        scrollHeight,
        clientWidth,
        clientHeight,
      } = scrollRef.current;

      setScrollState({
        left: scrollLeft > 0,
        right: scrollLeft + clientWidth < scrollWidth,
        top: scrollTop > 0,
        bottom: scrollTop + clientHeight < scrollHeight,
      });
    };

    React.useEffect(() => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;

      updateScrollState();
      scrollElement.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);

      return () => {
        scrollElement.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }, []);

    const scroll = (amount: number, direction: "x" | "y") => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollTop } = scrollRef.current;

      if (direction === "x") {
        scrollRef.current.scrollTo({
          left: scrollLeft + amount,
          behavior: "smooth",
        });
      } else {
        scrollRef.current.scrollTo({
          top: scrollTop + amount,
          behavior: "smooth",
        });
      }
    };

    // Separate indicators from other children
    const indicators: React.ReactElement[] = [];
    const content: React.ReactElement[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      if (
        child.type === ScrollViewIndicatorLeft ||
        child.type === ScrollViewIndicatorRight ||
        child.type === ScrollViewIndicatorTop ||
        child.type === ScrollViewIndicatorBottom
      ) {
        // Add scroll handlers and show state to indicators
        const enhancedIndicator = React.cloneElement(
          child as React.ReactElement<{
            onPointerUp?: () => void;
            show?: boolean;
            scrollAmount?: number;
          }>,
          {
            onPointerUp: () => {
              const amount = (child as any).props.scrollAmount || 200;
              const direction =
                child.type === ScrollViewIndicatorLeft ||
                child.type === ScrollViewIndicatorRight
                  ? "x"
                  : "y";
              const isNegative =
                child.type === ScrollViewIndicatorLeft ||
                child.type === ScrollViewIndicatorTop;

              scroll(isNegative ? -amount : amount, direction);
            },
            show:
              child.type === ScrollViewIndicatorLeft
                ? scrollState.left
                : child.type === ScrollViewIndicatorRight
                ? scrollState.right
                : child.type === ScrollViewIndicatorTop
                ? scrollState.top
                : scrollState.bottom,
          }
        );
        indicators.push(enhancedIndicator);
      } else {
        content.push(child);
      }
    });

    return (
      <div className="relative" ref={ref}>
        {indicators}
        <div
          ref={scrollRef}
          className={kit(
            "relative overflow-auto scroll-smooth scrollbar-none",
            className
          )}
          {...props}
        >
          {content}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

/*################################ (SCROLL VIEW) ###############################*/
/* A component that combines ScrollView animation features with ScrollArea functionality
 * @param children The children to animate and/or scroll
 * @param className The class name of the component
 * @param animate The animation type
 * @param duration The duration of the animation
 * @param delay The delay of the animation
 * @param yOffset The offset of the animation
 * @param inView If true, the animation will only play once when the component is in view
 * @param inViewMargin The margin of the in view
 * @param scrollable If true (default), the presentation window will retain its primitive scroll functionality, if false, the presentation window will not be scrollable
 * @param preserveChildren If true, the component will not wrap children in with base animation features, useful for interactive elements e.g draggable columns etc...
 * @returns
 */
export default function ScrollView({
  children,
  className,
  style,
  animate = "blurFade",
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = true,
  inViewMargin = "-50px",
  scrollable = true,
  scrollbar = false,
  preserveChildren = false,
  ...props
}: ScrollViewProps) {
  /*################################ (HOOKS) ###############################*/
  const ref = React.useRef<HTMLDivElement>(null);
  const inViewResult = useInView(ref, {
    once: true,
    margin: inViewMargin as any,
  });

  /*################################ (VARIABLES) ###############################*/
  const isInView = !inView || inViewResult;
  const selectedVariant = React.useMemo(() => {
    if (animate === "bounce") {
      return {
        hidden: animationVariants.bounce.hidden,
        visible: {
          ...animationVariants.bounce.visible,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 10,
            delay,
          },
        },
      };
    }
    return animationVariants[animate];
  }, [animate, delay]);

  /*################################ (RENDER) ###############################*/
  const content = preserveChildren ? (
    <div
      ref={ref}
      className={kit(`overflow-hidden`, className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  ) : (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={selectedVariant}
        transition={{
          delay: delay,
          duration: animate === "bounce" ? undefined : duration,
          ease: "easeOut",
        }}
        className={kit(`overflow-hidden scrollbar-hide`, className)}
        style={style}
        {...(props as any)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  if (scrollable === true) {
    return (
      <ScrollArea
        className={kit(
          `h-full w-full ${scrollbar === false && "scrollbar-hide"}`,
          className
        )}
        ref={ref}
      >
        {content}
      </ScrollArea>
    );
  }

  return content;
}
