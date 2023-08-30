import clsx from "clsx";

export const SectionContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col w-full items-center px-4 border-b border-line",
        className
      )}
    >
      {children}
    </div>
  );
};