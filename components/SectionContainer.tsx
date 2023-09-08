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
        "flex flex-col w-full items-center px-4",
        className
      )}
    >
      {children}
    </div>
  );
};
