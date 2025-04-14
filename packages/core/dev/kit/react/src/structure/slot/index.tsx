"use client";

import React from "react";
import PropTypes from "prop-types";

/**
 * # Slot
 *
 * A minimal implementation of a slot component for React that uses
 * basic props and children without complex React features.
 *
 * This component acts as a placeholder for content that can be
 * replaced from a parent component via props. If no content is
 * provided for the slot, it renders its children as default content.
 *
 * ## Usage:
 *
 * ```tsx
 * // Define your component with slots
 * function Card({ header, content, footer }) {
 *   return (
 *     <div className="card">
 *       <div className="card-header">
 *         <Slot content={header}>Default Header</Slot>
 *       </div>
 *       <div className="card-body">
 *         <Slot content={content}>Default Content</Slot>
 *       </div>
 *       <div className="card-footer">
 *         <Slot content={footer}>Default Footer</Slot>
 *       </div>
 *     </div>
 *   );
 * }
 *
 * // Use the component with custom content for slots
 * <Card
 *   header={<h2>Custom Header</h2>}
 *   content={<p>Custom content goes here</p>}
 *   footer={<button>Action</button>}
 * />
 * ```
 */
export default function Slot({
  content,
  className,
  children,
}: {
  content?: React.ReactNode;
  className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  children: PropTypes.node,
}) {
  // If content is provided, use it. Otherwise, use children as fallback
  return (
    <slot className={className}>
      {content !== undefined ? content : children}
    </slot>
  );
}
