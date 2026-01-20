"use client";
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";
export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  return (
    <div>Informatik Projekt</div>
  );
}
