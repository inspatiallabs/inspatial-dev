"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  Variants,
  useAnimate,
  stagger,
  useInView,
} from "motion/react";
import { kit } from "@inspatial/theme";
import { SharedProps } from "@inspatial/type/util";
import { ITypographyProps } from "@inspatial/theme";
import { type as createType } from "@inspatial/type";
import {
  sizeClassMap,
  weightClassMap,
  transformClassMap,
  letterSpacingMap,
} from "./helpers.ts";

/*##############################################(TYPE)##############################################*/

type AnimationStyleType =
  | "none"

  //Text
  | "rotate"
  | "flip"
  | "pullUp"
  | "fadeUp"
  | "fadeDown"
  | "fadeLeft"
  | "fadeRight"
  | "fadeIn"
  | "reveal"
  | "blurIn"
  | "typing"
  | "generate"
  | "ticker"
  | "reUp"
  | "gradual"

  // Pattern
  | "slideRight"
  | "fadeOut"
  | "scaleDown";

// Explicitly typed constant for JSR
const InTextPropsType = createType({
  words: "string | string[]?",
  motions: "object?",
  duration: "number?",
  delay: "number?",
});

type TextProps = typeof InTextPropsType.infer &
  ITypographyProps &
  SharedProps & {
    animate?: AnimationStyleType;
  };

/*##############################################(ANIMATION VARIANTS)##############################################*/

const rotateVariants: Variants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
};

const flipVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40, x: 40, filter: "blur(8px)", scale: 2 },
};

const pullUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0 },
};

const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const revealVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0 },
};

const defaultBlurVariants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

const reUpVariants: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.05,
    },
  }),
};

const gradualVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

/*##############################################(TEXT COMPONENT)##############################################*/
/**
 * A Spatial Kit component that renders text with various animation effects.
 * @version Beta (0.1.0) - some animation effects may not work as expected
 */
export const Text: React.FC<TextProps> = ({
  className,
  font,
  weight,
  size,
  lineHeight,
  letterSpacing,
  transform,
  animate = "none",
  words,
  motions,
  delay,
  duration = 2500,
  children,
  ...props
}: TextProps) => {
  /*##############################################(STATE)##############################################*/
  const [index, setIndex] = React.useState(0);
  const [currentWord, setCurrentWord] = React.useState(
    Array.isArray(words) ? words[0] : words || ""
  );
  const [isAnimating, setIsAnimating] = React.useState<boolean>(false);
  const [displayedText, setDisplayedText] = React.useState<string>("");

  /*##############################################(HOOKS)##############################################*/
  const [scope, animateGenerate] = useAnimate();
  const tickerRef = React.useRef<HTMLSpanElement>(null);
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const isInView = useInView(tickerRef, { once: true, margin: "0px" });

  /*##############################################(FUNCTIONS)##############################################*/

  const startAnimation = React.useCallback(() => {
    if (Array.isArray(words)) {
      const nextIndex = (index + 1) % words.length;
      setIndex(nextIndex);
      setCurrentWord(words[nextIndex]);
    }
    setIsAnimating(true);
  }, [index, words]);

  // Generate CSS classes based on props
  const getTypographyClasses = React.useCallback(() => {
    let classes = "";

    // Add size classes if specified
    if (size && sizeClassMap[size]) {
      classes += ` ${sizeClassMap[size]}`;
    }

    // Add weight classes if specified
    if (weight && weightClassMap[weight]) {
      classes += ` ${weightClassMap[weight]}`;
    }

    // Add transform classes if specified
    if (transform && transformClassMap[transform]) {
      classes += ` ${transformClassMap[transform]}`;
    }

    // Add letter spacing classes if specified
    if (letterSpacing && letterSpacingMap[letterSpacing]) {
      classes += ` ${letterSpacingMap[letterSpacing]}`;
    }

    return classes.trim();
  }, [size, weight, transform, letterSpacing]);

  /*##############################################(EFFECTS)##############################################*/
  React.useEffect(() => {
    if (
      Array.isArray(words) &&
      !animate.startsWith("fade") &&
      !["none", "reveal", "blurIn", "typing", "generate"].includes(animate)
    ) {
      const interval = setInterval(startAnimation, duration);
      return () => clearInterval(interval);
    }
  }, [words, duration, startAnimation, animate]);

  // Typing effect
  React.useEffect(() => {
    if (animate === "typing") {
      let i = 0;
      const text = currentWord || (children as string);
      const typingEffect = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingEffect);
        }
      }, duration / text.length);
      return () => {
        clearInterval(typingEffect);
      };
    }
  }, [animate, currentWord, children, duration]);

  // Generate effect
  React.useEffect(() => {
    if (animate === "generate" && scope.current) {
      animateGenerate(
        "span",
        {
          opacity: 1,
        },
        {
          duration: 2,
          delay: stagger(0.2),
        }
      );
    }
  }, [animate, scope, animateGenerate]);

  // Ticker effect
  const getRandomChar = (char: string) => {
    if (/[a-zA-Z]/.test(char)) {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    } else if (/[0-9]/.test(char)) {
      return Math.floor(Math.random() * 10).toString();
    }
    return char;
  };

  React.useEffect(() => {
    if (animate === "ticker" && isInView) {
      const content = currentWord || (children as string);
      const chars = content.split("");

      // Set initial random state
      if (tickerRef.current) {
        tickerRef.current.textContent = chars.map(getRandomChar).join("");
      }

      const animateChar = (char: string, index: number) => {
        return new Promise<void>((resolve) => {
          if (/[a-zA-Z]/.test(char)) {
            let start = "A".charCodeAt(0);
            let end = char.toUpperCase().charCodeAt(0);
            let current = start;

            const alphabetInterval = setInterval(() => {
              if (tickerRef.current && tickerRef.current.textContent) {
                tickerRef.current.textContent =
                  tickerRef.current.textContent.slice(0, index) +
                  String.fromCharCode(current) +
                  tickerRef.current.textContent.slice(index + 1);
              }
              if (current === end) {
                clearInterval(alphabetInterval);
                resolve();
              }
              current = ((current + 1 - 65) % 26) + 65;
            }, duration / (chars.length * 26));
          } else if (/[0-9]/.test(char)) {
            let current = 0;
            const numberInterval = setInterval(() => {
              if (tickerRef.current && tickerRef.current.textContent) {
                tickerRef.current.textContent =
                  tickerRef.current.textContent.slice(0, index) +
                  current +
                  tickerRef.current.textContent.slice(index + 1);
              }
              if (current === parseInt(char)) {
                clearInterval(numberInterval);
                resolve();
              }
              current++;
            }, duration / (chars.length * 10));
          } else {
            resolve();
          }
        });
      };

      const animateSequentially = async () => {
        for (let i = 0; i < chars.length; i++) {
          await animateChar(chars[i], i);
        }
      };

      setTimeout(() => {
        animateSequentially();
      }, delay);
    }
  }, [animate, isInView, currentWord, children, duration, delay]);

  /*##############################################(RENDER)##############################################*/
  function renderContent() {
    const content = currentWord || children;

    /**
     * Helper function to wrap text nodes
     */
    const wrapTextNodes = (nodes: any): React.ReactNode => {
      return React.Children.map(nodes, (node: any) => {
        if (typeof node === "string") {
          return node.split("").map((char, index) => (
            <motion.span key={index} className="inline-block overflow-hidden">
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ));
        } else if (React.isValidElement(node)) {
          return React.cloneElement(
            node as React.ReactElement<any>,
            {},
            wrapTextNodes((node as React.ReactElement<any>).props.children)
          );
        }
        return node;
      });
    };

    switch (animate) {
      case "rotate":
        return (
          <div className="inline-flex items-center">
            <motion.div
              key={currentWord}
              variants={rotateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="inline-block"
              {...motions}
            >
              {wrapTextNodes(content)}
            </motion.div>
          </div>
        );
      case "flip":
        return (
          <div className="inline-flex items-center">
            <motion.div
              key={currentWord}
              variants={flipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: "easeInOut",
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
              className="inline-block"
              {...motions}
            >
              {String(content)
                .split("")
                .map((letter, index) => (
                  <motion.span
                    key={currentWord + index}
                    initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="inline-block"
                  >
                    {letter === " " ? (
                      <span>&nbsp;</span>
                    ) : (
                      wrapTextNodes(letter)
                    )}
                  </motion.span>
                ))}
            </motion.div>
          </div>
        );
      case "pullUp":
        return (
          <div className="inline-flex items-center">
            <motion.div
              variants={pullUpVariants}
              initial="hidden"
              animate="show"
              className="inline-flex flex-wrap"
              {...motions}
            >
              {(Array.isArray(words) ? words : String(content).split(" ")).map(
                (word, i) => (
                  <motion.span
                    key={i}
                    variants={pullUpVariants}
                    style={{ display: "inline-block", paddingRight: "8px" }}
                  >
                    {word === "" ? <span>&nbsp;</span> : wrapTextNodes(word)}
                  </motion.span>
                )
              )}
            </motion.div>
          </div>
        );
      case "fadeUp":
      case "fadeDown":
      case "fadeLeft":
      case "fadeRight":
      case "fadeIn":
        return (
          <div className="inline-flex items-center">
            <motion.div
              variants={
                animate === "fadeUp"
                  ? fadeUpVariants
                  : animate === "fadeDown"
                  ? fadeDownVariants
                  : animate === "fadeLeft"
                  ? fadeLeftVariants
                  : animate === "fadeRight"
                  ? fadeRightVariants
                  : fadeInVariants
              }
              className="inline-block"
              {...motions}
            >
              {wrapTextNodes(content)}
            </motion.div>
          </div>
        );
      case "reveal":
        return (
          <div className="inline-flex items-center">
            <motion.div
              variants={revealVariants}
              initial="hidden"
              animate="show"
              className="inline-block"
              {...motions}
            >
              {String(content)
                .split("")
                .map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="inline-block"
                  >
                    {letter === " " ? "\u00A0" : wrapTextNodes(letter)}
                  </motion.span>
                ))}
            </motion.div>
          </div>
        );
      case "blurIn":
        return (
          <div className="inline-flex items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ duration: 1 }}
              variants={defaultBlurVariants}
              className="inline-block"
              {...motions}
            >
              {wrapTextNodes(content)}
            </motion.div>
          </div>
        );
      case "typing":
        return <div className="inline-flex items-center">{displayedText}</div>;
      case "generate":
        return (
          <div className="inline-flex items-center">
            <motion.div ref={scope} className="inline-flex flex-wrap">
              {String(content)
                .split(" ")
                .map((word, idx) => (
                  <motion.span
                    key={word + idx}
                    className="opacity-0 inline-block mr-1"
                  >
                    {wrapTextNodes(word)}
                  </motion.span>
                ))}
            </motion.div>
          </div>
        );
      case "ticker":
        return (
          <div className="inline-flex items-center">
            <span
              ref={tickerRef}
              className="inline-block tabular-nums tracking-wider"
            >
              {wrapTextNodes(content)}
            </span>
          </div>
        );
      case "reUp":
        return (
          <div className="inline-flex items-center">
            {String(content)
              .split("")
              .map((letter, i) => (
                <motion.span
                  key={i}
                  variants={reUpVariants}
                  initial="initial"
                  animate="animate"
                  custom={i}
                  className="inline-block"
                >
                  {letter === " " ? <span>&nbsp;</span> : wrapTextNodes(letter)}
                </motion.span>
              ))}
          </div>
        );
      case "gradual":
        return (
          <div className="inline-flex items-center space-x-1">
            <AnimatePresence>
              {String(content)
                .split("")
                .map((char, i) => (
                  <motion.span
                    key={i}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={gradualVariants}
                    transition={{
                      duration: duration / 1000,
                      delay: i * 0.04,
                    }}
                    className="drop-shadow-sm"
                  >
                    {char === " " ? <span>&nbsp;</span> : wrapTextNodes(char)}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center">
            {wrapTextNodes(content)}
          </div>
        );
    }
  }

  /*##############################################(RETURN)##############################################*/

  return (
    <p
      ref={textRef}
      className={
        typeof kit === "function"
          ? kit(
              getTypographyClasses(),
              "overflow-hidden flex w-full",
              className
            )
          : `${getTypographyClasses()} overflow-hidden flex w-full ${
              className || ""
            }`
      }
      style={{
        lineHeight: lineHeight,
        ...(font?.heading && { fontFamily: font.heading }),
        ...(font?.body && { fontFamily: font.body }),
      }}
      {...props}
    >
      {animate !== "none" ? (
        <AnimatePresence
          mode="wait"
          onExitComplete={() => setIsAnimating(false)}
        >
          {renderContent()}
        </AnimatePresence>
      ) : (
        children
      )}
    </p>
  );
};

/*##############################################(DISPLAY NAME)##############################################*/
Text.displayName = "Text";
