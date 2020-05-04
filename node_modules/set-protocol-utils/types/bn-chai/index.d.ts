declare module "bn-chai" {
  function bnChai(bn?: any): (chai: any, utils: any) => void;

  namespace bnChai {

  }

  export = bnChai;
}

declare namespace Chai {
  interface Equal {
    BN: Equal;
  }
}
