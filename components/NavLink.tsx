"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HTMLAttributeAnchorTarget, MouseEventHandler } from "react";

export const NavLink = ({
  href,
  children,
  className,
  target,
  isActive,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: HTMLAttributeAnchorTarget;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) => {
  const pathname = usePathname();
  if (isActive === undefined) {
    isActive = pathname === href;
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      passHref
      className={`${
        isActive ? "border-b-2 text-white" : "text-accent"
      } h-16 no-underline flex items-center px-2 text-sm border-primary ${className}`}
      target={target}
    >
      {children}
    </Link>
  );
};
