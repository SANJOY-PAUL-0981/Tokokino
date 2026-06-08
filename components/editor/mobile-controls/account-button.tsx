"use client"

import * as React from "react"
import {
  RiGalleryLine,
  RiHardDrive2Line,
  RiLogoutBoxLine,
  RiSettings3Line,
  RiUserLine,
} from "@remixicon/react"
import { useRouter } from "next/navigation"

import { AccountAvatar } from "@/components/editor/account-avatar"
import { SettingsDialog } from "@/components/editor/settings/settings-dialog"
import { StorageDialog } from "@/components/editor/storage-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { signOut, useSession } from "@/lib/auth-client"

export function MobileAccountButton() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [storageOpen, setStorageOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const user = session?.user

  const triggerClass =
    "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary/50 text-foreground/70 transition-colors hover:text-foreground"

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className={triggerClass}
        aria-label="Sign in"
      >
        <RiUserLine className="size-[18px]" />
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClass} aria-label="Account">
          <AccountAvatar
            src={user.image}
            name={user.name}
            className="size-7 rounded-full ring-1 ring-border/70"
            iconClassName="size-[18px]"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-48 p-1"
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            router.push("/app/shares")
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
        >
          <RiGalleryLine className="size-4 text-muted-foreground" />
          My Shares
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setStorageOpen(true)
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
        >
          <RiHardDrive2Line className="size-4 text-muted-foreground" />
          Storage
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setSettingsOpen(true)
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
        >
          <RiSettings3Line className="size-4 text-muted-foreground" />
          Settings
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            void signOut()
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-destructive transition-colors hover:bg-destructive/10"
        >
          <RiLogoutBoxLine className="size-4" />
          Sign out
        </button>
      </PopoverContent>
      <StorageDialog open={storageOpen} onOpenChange={setStorageOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </Popover>
  )
}
