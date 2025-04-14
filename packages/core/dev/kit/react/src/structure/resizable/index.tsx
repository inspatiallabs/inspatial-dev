// "use client";

// import * as ResizablePrimitive from "react-resizable-panels";
// import { kit } from "@inspatial/theme/variant";
// import { GripVertical as GripVerticalIcon } from "@inspatial/kit/icon";

// export const ResizablePanelGroup = ({
//   className,
//   ...props
// }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
//   <ResizablePrimitive.PanelGroup
//     className={kit(
//       "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
//       className
//     )}
//     {...props}
//   />
// );

// export const ResizablePanel = ResizablePrimitive.Panel;

// export const ResizableHandle = ({
//   withHandle,
//   className,
//   ...props
// }: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
//   withHandle?: boolean;
// }) => (
//   <ResizablePrimitive.PanelResizeHandle
//     className={kit(
//       "relative cursor-resize-x p-0.5 flex items-center justify-center bg-colored hover:bg-brand dark:hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full [&[data-panel-group-direction=vertical]>div]:rotate-90",
//       className
//     )}
//     {...props}
//   >
//     <div className="relative w-1 bg-inherit h-full">
//       <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-inherit after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:left-0 data-[panel-group-direction=vertical]:h-10 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0" />
//       {withHandle && (
//         <div className="absolute z-[101] flex h-4 w-3 items-center justify-center rounded-sm border bg-muted cursor-resize-x left-1/2 -translate-x-1/2 data-[panel-group-direction=vertical]:left-1/2 data-[panel-group-direction=vertical]:-translate-x-1/2 data-[panel-group-direction=vertical]:-translate-y-1/2">
//           <GripVerticalIcon className="h-2.5 w-2.5" />
//         </div>
//       )}
//     </div>
//   </ResizablePrimitive.PanelResizeHandle>
// );
