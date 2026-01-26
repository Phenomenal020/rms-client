"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  name: string;
  image?: string | null;
}

export function UserAvatar({
  name,
  image,
  className,
  ...props
}: UserAvatarProps) {
  
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
