"use client";


import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  image,
  className,
  ...props
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("");

  return (
    <Avatar className={cn(className)} {...props}>
      <AvatarImage
        src={image ?? undefined}
        alt={name}
        className="aspect-square object-cover"
      />
      <AvatarFallback className="border">{initials}</AvatarFallback>
    </Avatar>
  );
}
