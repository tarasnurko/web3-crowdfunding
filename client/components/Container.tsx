import React, { ReactNode } from "react";

export const Container = ({ children }: { children: ReactNode }) => {
  return <div className="w-full grow flex justify-center p-10">{children}</div>;
};
