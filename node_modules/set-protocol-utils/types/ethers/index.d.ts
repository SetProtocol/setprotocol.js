declare module 'ethers' {
  export type ParamName = null | string | NestedParamName;
  export interface NestedParamName {
    name: string | null;
    names: ParamName[];
  }
}
