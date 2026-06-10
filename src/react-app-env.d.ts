/// <reference types="react-scripts" />

// Allow side-effect imports of .scss files
declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}
