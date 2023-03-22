declare function verify(
    verifyBody: any,
    options: {
      sizeRatio?: number;
      theme?: string;
      insideColor?: string;
      outsideColor?: string;
      success?: () => void;
    }
  ): void;
  
  export = verify;