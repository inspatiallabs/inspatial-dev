import type * as DOMStyle from 'csstype' // TODO: get all the type internally 

export interface DOMStyleProperties
  extends DOMStyle.Properties<string | number>,
    DOMStyle.PropertiesHyphen<string | number> {
        [dom: `--${string}`]: string | number | undefined
}