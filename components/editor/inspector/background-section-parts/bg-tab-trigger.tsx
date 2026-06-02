"use client"

import * as React from "react"

import { TabsTrigger } from "@/components/ui/tabs"

export function BgTabTrigger({
  value,
  label,
  children,
}: {
  value: string
  label: string
  children: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className="group flex h-auto cursor-pointer flex-col items-center gap-2 border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-active:!bg-transparent dark:data-active:!bg-transparent"
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg transition-all duration-150 group-data-[state=active]:bg-[#e8445a]/10">
        {children}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground transition-colors group-data-[state=active]:text-[#e8445a]">
        {label}
      </span>
    </TabsTrigger>
  )
}
