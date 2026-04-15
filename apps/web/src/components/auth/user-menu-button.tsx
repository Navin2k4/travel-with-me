"use client";

import { UserCircleIcon } from "@phosphor-icons/react";
import { UserButton } from "@clerk/nextjs";

export function UserMenuButton() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.UserProfileLink
          label="Profile"
          url="/profile"
          labelIcon={<UserCircleIcon size={16} weight="duotone" />}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
