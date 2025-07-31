/**
 * anime.js - ESM
 * @version v4.1.2
 * @author Julian Garnier
 * @license MIT
 * @copyright (c) 2025 Julian Garnier
 * @see https://animejs.com
 */

/****************************************************
 * InMotion (InSpatial Motion)
 * @version v1.0.0
 * @author InSpatial Labs
 * @license Apache-2.0
 * @copyright (c) 2026 InSpatial Labs
 * @see https://inspatial.dev/motion
 ****************************************************/


import { minValue, K } from "./consts.ts";

import { globals } from "./globals.ts";

import { round, clamp, sqrt, exp, cos, sin, abs } from "./helpers.ts";

import { setValue } from "./values.ts";

import type { SpringParams, EasingFunction } from "./types.ts";

/**
 * @typedef {Object} SpringParams
 * @property {Number} [mass=1] - Mass, default 1
 * @property {Number} [stiffness=100] - Stiffness, default 100
 * @property {Number} [damping=10] - Damping, default 10
 * @property {Number} [velocity=0] - Initial velocity, default 0
 */

/**
 * # InMotion Spring
 * @summary #### A physics-based spring system that generates realistic easing functions
 *
 * The `InMotionSpring` class creates easing functions based on spring physics. Think of it like a physical spring that stretches and bounces back.
 * It provides a more natural and realistic animation feel compared to traditional easing functions.
 *
 * @since 0.1.0
 * @category InSpatial Motion
 * @kind class
 * @access public
 *
 * ### 💡 Core Concepts
 * - Uses real physics equations to simulate spring behavior
 * - Configurable mass, stiffness, damping, and initial velocity
 * - Automatically calculates the appropriate duration based on physics
 * - Provides an easing function that can be used in animations
 *
 * ### 📚 Terminology
 * > **Mass**: How heavy the object attached to the spring is
 * > **Stiffness**: How rigid the spring is (higher values = more rigid)
 * > **Damping**: How quickly the spring stops oscillating (higher values = faster stopping)
 * > **Velocity**: Initial speed of the object
 *
 * @example
 * ### Example 1: Basic Spring Animation
 * ```typescript
 * import { createMotion, createMotionSpring } from "@in/motion";
 *
 * // Create a spring with custom physics parameters
 * const bouncy = createMotionSpring({
 *   mass: 1,        // Mass of the object
 *   stiffness: 100, // Spring stiffness
 *   damping: 10,    // Damping factor
 *   velocity: 2     // Initial velocity
 * });
 *
 * // Use the spring as an easing function in an animation
 * createMotion(".box", {
 *   translateX: 200,
 *   ease: bouncy.ease,
 *   duration: bouncy.duration // Spring calculates appropriate duration
 * });
 * ```
 *
 * @example
 * ### Example 2: Adjusting Spring Properties Dynamically
 * ```typescript
 * import { createMotion, createMotionSpring } from "@in/motion";
 *
 * // Create a spring with default values
 * const spring = createMotionSpring();
 *
 * // Adjust properties to create a bouncier effect
 * spring.stiffness = 120;
 * spring.damping = 5;    // Less damping = more bounce
 *
 * // The duration is automatically recalculated when properties change
 * console.log(spring.duration); // Duration updated based on new properties
 *
 * createMotion(".element", {
 *   scale: 1.5,
 *   ease: spring.ease,
 *   duration: spring.duration
 * });
 * ```
 */
export class InMotionSpring {
  /** Interval fed to the solver to calculate duration */
  timeStep: number;
  /** Values below this threshold are considered resting position */
  restThreshold: number;
  /** Duration in ms used to check if the spring is resting after reaching restThreshold */
  restDuration: number;
  /** The maximum allowed spring duration in ms (default 1 min) */
  maxDuration: number;
  /** How many steps allowed after reaching restThreshold before stopping the duration calculation */
  maxRestSteps: number;
  /** Calculate the maximum iterations allowed based on maxDuration */
  maxIterations: number;
  /** Mass of the spring system */
  m: number;
  /** Stiffness of the spring */
  s: number;
  /** Damping factor */
  d: number;
  /** Initial velocity */
  v: number;
  /** Angular frequency */
  w0: number;
  /** Damping ratio */
  zeta: number;
  /** Damped angular frequency */
  wd: number;
  /** Initial amplitude of the spring */
  b: number;
  /** Duration calculated by the solver */
  solverDuration: number;
  /** Final animation duration in milliseconds */
  duration: number;
  /** Easing function generated from the spring simulation */
  ease: EasingFunction;

  /**
   * Creates a new Spring instance with the specified parameters
   *
   * @param {SpringParams} [parameters] - Configuration options for the spring
   */
  constructor(parameters: SpringParams = {}) {
    this.timeStep = 0.02; // Interval fed to the solver to calculate duration
    this.restThreshold = 0.0005; // Values below this threshold are considered resting position
    this.restDuration = 200; // Duration in ms used to check if the spring is resting after reaching restThreshold
    this.maxDuration = 60000; // The maximum allowed spring duration in ms (default 1 min)
    this.maxRestSteps = this.restDuration / this.timeStep / K; // How many steps allowed after reaching restThreshold before stopping the duration calculation
    this.maxIterations = this.maxDuration / this.timeStep / K; // Calculate the maximum iterations allowed based on maxDuration
    this.m = clamp(setValue(parameters.mass, 1), 0, K);
    this.s = clamp(setValue(parameters.stiffness, 100), 1, K);
    this.d = clamp(setValue(parameters.damping, 10), 0.1, K);
    this.v = clamp(setValue(parameters.velocity, 0), -K, K);
    this.w0 = 0;
    this.zeta = 0;
    this.wd = 0;
    this.b = 0;
    this.solverDuration = 0;
    this.duration = 0;
    this.compute();
    this.ease = (t: number): number =>
      t === 0 || t === 1 ? t : this.solve(t * this.solverDuration);
  }

  /**
   * Solves the spring equation for a given time value
   *
   * @param {number} time - Time value to solve the equation for
   * @returns {number} Solved value between 0 and 1
   */
  solve(time: number): number {
    const { zeta, w0, wd, b } = this;
    let t = time;
    if (zeta < 1) {
      t = exp(-t * zeta * w0) * (1 * cos(wd * t) + b * sin(wd * t));
    } else {
      t = (1 + b * t) * exp(-t * w0);
    }
    return 1 - t;
  }

  /**
   * Computes the spring parameters based on the current configuration
   * This automatically calculates angular frequencies, damping ratios,
   * and the appropriate animation duration
   */
  compute(): void {
    const { maxRestSteps, maxIterations, restThreshold, timeStep, m, d, s, v } =
      this;
    const w0 = (this.w0 = clamp(sqrt(s / m), minValue, K));
    const zeta = (this.zeta = d / (2 * sqrt(s * m)));
    const wd = (this.wd = zeta < 1 ? w0 * sqrt(1 - zeta * zeta) : 0);
    this.b = zeta < 1 ? (zeta * w0 + -v) / wd : -v + w0;
    let solverTime = 0;
    let restSteps = 0;
    let iterations = 0;
    while (restSteps < maxRestSteps && iterations < maxIterations) {
      if (abs(1 - this.solve(solverTime)) < restThreshold) {
        restSteps++;
      } else {
        restSteps = 0;
      }
      this.solverDuration = solverTime;
      solverTime += timeStep;
      iterations++;
    }
    this.duration = round(this.solverDuration * K, 0) * globals.timeScale;
  }

  /**
   * Gets the mass of the spring system
   * @returns {number} Current mass value
   */
  get mass(): number {
    return this.m;
  }

  /**
   * Sets the mass of the spring system and recalculates parameters
   * @param {number} v - New mass value
   */
  set mass(v: number) {
    this.m = clamp(setValue(v, 1), 0, K);
    this.compute();
  }

  /**
   * Gets the stiffness of the spring
   * @returns {number} Current stiffness value
   */
  get stiffness(): number {
    return this.s;
  }

  /**
   * Sets the stiffness of the spring and recalculates parameters
   * @param {number} v - New stiffness value
   */
  set stiffness(v: number) {
    this.s = clamp(setValue(v, 100), 1, K);
    this.compute();
  }

  /**
   * Gets the damping factor of the spring
   * @returns {number} Current damping value
   */
  get damping(): number {
    return this.d;
  }

  /**
   * Sets the damping factor of the spring and recalculates parameters
   * @param {number} v - New damping value
   */
  set damping(v: number) {
    this.d = clamp(setValue(v, 10), 0.1, K);
    this.compute();
  }

  /**
   * Gets the initial velocity of the spring
   * @returns {number} Current velocity value
   */
  get velocity(): number {
    return this.v;
  }

  /**
   * Sets the initial velocity of the spring and recalculates parameters
   * @param {number} v - New velocity value
   */
  set velocity(v: number) {
    this.v = clamp(setValue(v, 0), -K, K);
    this.compute();
  }
}

/**
 * # createMotionSpring
 * @summary #### Creates a physics-based spring for natural easing functions
 *
 * This function creates a new Spring instance with the given parameters.
 * It's useful for creating realistic, physics-based animations.
 *
 * @param {SpringParams} [parameters] - Configuration options for the spring
 * @returns {Spring} A new Spring instance
 *
 * @example
 * ```typescript
 * import { createMotion, createMotionSpring } from "@in/motion";
 *
 * const spring = createMotionSpring({
 *   mass: 1,
 *   stiffness: 80,
 *   damping: 8
 * });
 *
 * createMotion(".element", {
 *   translateY: 100,
 *   ease: spring.ease,
 *   duration: spring.duration
 * });
 * ```
 */
export const createMotionSpring = (parameters?: SpringParams): InMotionSpring =>
  new InMotionSpring(parameters || {});
