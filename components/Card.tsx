interface Props {
  children: React.ReactNode | React.ReactNode[];
}

export const Card = ({ children }: Props) => {
  const childrenArray = Array.isArray(children) ? children : [children];
  return (
    <div className="w-full h-fit border border-line rounded-xl divide-y divide-line overflow-x-hidden">
      {childrenArray.filter(Boolean).map((child, i) => (
        <div key={i} className="flex flex-1 overflow-auto ">
          <div className="flex flex-1 flex-row w-full">
            <div className="flex flex-col flex-1 px-4 divide-y divide-line">
              {child}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
