declare global {
  interface Window {
    online?: any;
    onlineSrc?: any;
    panel?: any;
    ws?: any
    prefix?: any
    mapping? :any
    table?:any
    column?:any
    screenName?:any
    $?:any
    go?:any,
    _language?:any
  }
}

declare module 'jointjs' {
  export namespace shapes {
    export namespace app {
      class FunctionBlock {
        constructor()
      }
      class VariableDot {
        constructor()
      }
    }
  }
}

export {}
