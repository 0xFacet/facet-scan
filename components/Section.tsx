import clsx from "clsx";

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col w-full max-w-7xl p-4 sm:p-8 overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
};
