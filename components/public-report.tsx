"use client";
import { RoastReport } from "@/components/roast-report";
import type { RoastResult } from "@/types/roast";
export function PublicReport({roast}:{roast:RoastResult}) { return <RoastReport roast={roast} onPublished={()=>{}}/>; }

