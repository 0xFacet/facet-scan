import { isValidElement } from "react";

const renderValue = (value: any) => {
  if (isValidElement(value)) return value;

  switch (typeof value) {
    case "boolean":
      return <span>{value.toString()}</span>;
    case "object":
      if (Array.isArray(value)) {
        return (
          <List
            items={value.reduce(
              (previousValue, currentValue, currentIndex) => [
                ...previousValue,
                { label: currentIndex, value: currentValue },
              ],
              []
            )}
          />
        );
      }
      return (
        <pre style={{ padding: "10px" }}>{JSON.stringify(value, null, 2)}</pre>
      );
    default:
      return <span>{value}</span>;
  }
};

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
            className="py-4 sm:grid sm:grid-cols-3 sm:gap-4"
          >
            <dt className="text-sm font-medium leading-6 text-accent">
              {item.label}
            </dt>
            <dd
              className="flex mt-1 leading-6 sm:col-span-2 sm:mt-0 items-center"
              title={typeof item.value === "string" ? item.value : undefined}
            >
              <div className="overflow-auto">{renderValue(item.value)}</div>
            </dd>
          </div>
        ))}
    </dl>
  );
};
