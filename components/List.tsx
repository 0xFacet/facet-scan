export const List = ({
  items,
}: {
  items: { label: any; value: any; hidden?: boolean }[];
}) => {
  return (
    <dl className="divide-y divide-line">
      {items
        .filter((i) => !i.hidden)
        .map((item) => (
          <div
            key={item.label}
            className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
          >
            <dt className="text-sm font-medium leading-6 text-accent">
              {item.label}
            </dt>
            <dd
              className="flex mt-1 leading-6 sm:col-span-2 sm:mt-0 truncate items-center"
              title={typeof item.value === "string" ? item.value : undefined}
            >
              {item.value}
            </dd>
          </div>
        ))}
    </dl>
  );
};
