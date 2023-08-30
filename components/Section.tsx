import clsx from "clsx";

export const Section = ({
  children,
  className,
}: {
  children: any | any[];
  className?: string;
}) => {
  return (
    <section
      className={clsx(
        "flex flex-col w-full max-w-7xl p-6 border-x border-line overflow-x-auto",
        className
      )}
    >
      {children}
    </section>
  );
};
