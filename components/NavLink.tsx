"use client";

import Link from "next/link";
import { HTMLAttributeAnchorTarget, MouseEventHandler } from "react";

export const NavLink = ({
  href,
  children,
  classNames,
  target,
  isActive,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  classNames?: string;
  target?: HTMLAttributeAnchorTarget;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      passHref
      className={`${
        isActive ? "border-b-2" : "text-secondary"
      } h-20 no-underline pb-6 pt-7 px-2 text-base border-primary hover:text-primary transition-all duration-300 ${classNames}`}
      target={target}
    >
      {children}
    </Link>
  );
};
