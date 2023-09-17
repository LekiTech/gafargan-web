"use client";
import React, { FC } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

type ProviderProps = {
  children: React.ReactNode;
};

export const Providers: FC<ProviderProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
}