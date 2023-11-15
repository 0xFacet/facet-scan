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
        "flex flex-col w-full items-center border-b border-line",
        className
      )}
    >
      {children}
    </div>
  );
};
