import clsx from "clsx";

export const Heading = ({
  children,
  size = "h1",
  className,
}: {
  children: React.ReactNode;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}) => {
  const defaultClassNames = "font-black tracking-tight mb-0";
  switch (size) {
    case "h2":
      return (
        <h2
          className={clsx(defaultClassNames, "text-2xl md:text-3xl", className)}
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          className={clsx(defaultClassNames, "text-xl md:text-2xl", className)}
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          className={clsx(defaultClassNames, "text-lg md:text-xl", className)}
        >
          {children}
        </h4>
      );
    case "h5":
      return (
        <h5
          className={clsx(defaultClassNames, "text-md md:text-lg", className)}
        >
          {children}
        </h5>
      );
    case "h6":
      return (
        <h6
          className={clsx(defaultClassNames, "text-sm md:text-md", className)}
        >
          {children}
        </h6>
      );
    default:
      return (
        <h1
          className={clsx(defaultClassNames, "text-4xl md:text-5xl", className)}
        >
          {children}
        </h1>
      );
  }
};
