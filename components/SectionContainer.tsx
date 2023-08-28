import clsx from "clsx";

export const SectionContainer = ({
  children,
  className,
}: {
  children: any | any[];
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col w-full items-center px-4 border-b-[1px] border-[rgba(255,255,255,0.2)]",
        className
      )}
    >
      {children}
    </div>
  );
};
