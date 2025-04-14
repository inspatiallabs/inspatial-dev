// import PrimitiveBanner from "./primitive.tsx";

// /*####################################(TYPES)####################################*/

// export interface BannerWidgetProps {
//   icon: string;
//   title: string;
//   description: string;
//   ctaLabel: string;
//   onPointerUp: () => void;
// }

// /*####################################(COMPONENT)####################################*/

// /**
//  * An abstraction of the Primitive Banner that component from Primitive Design System
//  */

// export default function BannerWidget(props: BannerWidgetProps) {
//   /*****************************(Props)*****************************/
//   const { icon, title, description, ctaLabel, onPointerUp } = props;

//   return (
//     <PrimitiveBanner>
//       <PrimitiveBanner.Icon src={icon} />
//       <PrimitiveBanner.Content>
//         <PrimitiveBanner.Title>{title}</PrimitiveBanner.Title>
//         <PrimitiveBanner.Description>{description}</PrimitiveBanner.Description>
//       </PrimitiveBanner.Content>
//       <PrimitiveBanner.CTA label={ctaLabel} onPointerUp={onPointerUp} />
//     </PrimitiveBanner>
//   );
// }
