declare module 'framer-motion' {
  export const motion: {
    div: any;
    span: any;
    button: any;
    p: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    a: any;
    ul: any;
    ol: any;
    li: any;
    nav: any;
    footer: any;
    header: any;
    article: any;
    section: any;
    main: any;
    aside: any;
    form: any;
    input: any;
    textarea: any;
    select: any;
    option: any;
    label: any;
    [key: string]: any;
  };
  
  export interface AnimationProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    [key: string]: any;
  }
} 