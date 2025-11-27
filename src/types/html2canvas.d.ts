declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    /** Whether to allow cross-origin images to taint the canvas */
    allowTaint?: boolean;
    /** Canvas background color, if none is specified in DOM. Set null for transparent */
    backgroundColor?: string | null;
    /** Define the height of the canvas in pixels. */
    height?: number;
    /** Define the width of the canvas in pixels. */
    width?: number;
    /** Whether to attempt to load cross-origin images as CORS served, before reverting back to proxy. */
    useCORS?: boolean;
    /** Scale factor for rendering. Defaults to browser device pixel ratio. */
    scale?: number;
    /** X scroll position to use when rendering element */
    scrollX?: number;
    /** Y scroll position to use when rendering element */
    scrollY?: number;
    /** Window width to use when rendering element */
    windowWidth?: number;
    /** Window height to use when rendering element */
    windowHeight?: number;
    /** Whether to ignore elements with pointer-events: none */
    ignoreElements?: (element: Element) => boolean;
    /** Callback function which is called every time a element is added to the DOM. */
    onclone?: (doc: Document) => void;
    /** Whether to log events in the console. */
    logging?: boolean;
    /** Image timeout */
    imageTimeout?: number;
  }

  const html2canvas: (element: HTMLElement, options?: Html2CanvasOptions) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}