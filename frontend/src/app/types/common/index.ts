import React from "react";

export interface IComponent<P = {}> {
    (props: P, context?: any):
      | React.ReactElement<any, any>
      | React.ReactNode
      | null;
    displayName?: any;
  }
  
