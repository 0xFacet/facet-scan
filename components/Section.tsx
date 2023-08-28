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
        "flex flex-col w-full max-w-7xl p-6 border-x-[1px] border-[rgba(255,255,255,0.2)]",
        className
      )}
    >
      {children}
    </section>
  );
};
