// File: src/components/PrivateRoute.tsx
"use client";
import Layout from "@/components/Layout";

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  return <Layout>{children}</Layout>;
};

export default PrivateRoute;
