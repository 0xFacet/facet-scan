import clsx from "clsx";

export const Grid = ({ children, className }: { children: JSX.Element | JSX.Element[]; className?: string }) => {
  return (
    <div className={clsx("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {children}
    </div>
  );
};
