// 'use client';
// import React from 'react';
// import PropTypes from 'prop-types';
// import type { SwitchRoot } from '../root/SwitchRoot';
// import { useSwitchRootContext } from '../root/SwitchRootContext';
// import { useComponentRenderer } from '../../utils/useComponentRenderer';
// import { useFieldRootContext } from '../../field/root/FieldRootContext';
// import type { BaseUIComponentProps } from '../../utils/types';
// import { styleHookMapping } from '../styleHooks';

// const SwitchThumb = React.forwardRef(function SwitchThumb(
//   props: SwitchThumb.Props,
//   forwardedRef: React.ForwardedRef<HTMLSpanElement>,
// ) {
//   const { render, className, ...other } = props;

//   const { state: fieldState } = useFieldRootContext();

//   const state = useSwitchRootContext();
//   const extendedState = { ...fieldState, ...state };

//   const { renderElement } = useComponentRenderer({
//     render: render || 'span',
//     className,
//     state: extendedState,
//     extraProps: other,
//     customStyleHookMapping: styleHookMapping,
//     ref: forwardedRef,
//   });

//   return renderElement();
// });

// namespace SwitchThumb {
//   export interface Props extends BaseUIComponentProps<'span', State> {}

//   export interface State extends SwitchRoot.State {}
// }

// SwitchThumb.propTypes /* remove-proptypes */ = {
//   /**
//    * @ignore
//    */
//   children: PropTypes.node,
//   /**
//    * CSS class applied to the element, or a function that
//    * returns a class based on the component’s state.
//    */
//   className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
//   /**
//    * Allows you to replace the component’s HTML element
//    * with a different tag, or compose it with another component.
//    *
//    * Accepts a `ReactElement` or a function that returns the element to render.
//    */
//   render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
// } as any;

// export { SwitchThumb };