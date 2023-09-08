import clsx from "clsx";

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={clsx(
        "flex flex-col w-full max-w-7xl p-6 overflow-x-auto",
        className
      )}
    >
      {children}
    </section>
  );
};
