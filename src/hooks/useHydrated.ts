"use client";
import { useEffect, useState } from "react";

/** true setelah komponen terpasang di browser (localStorage sudah terbaca). */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
