import clsx from "clsx";

export const Table = ({
  headers,
  rows,
  onRowClick,
}: {
  headers: (JSX.Element | string)[] | (JSX.Element | string)[][];
  rows: (JSX.Element | string)[][] | (JSX.Element | string)[][];
  onRowClick?: (index: number) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="overflow-hidden">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={clsx(
                      "py-4 whitespace-nowrap text-white opacity-50 text-sm font-normal",
                      i === 0 ? "text-left" : "text-right",
                      i === 0 ? "pl-0" : "pl-6"
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="border-b border-[rgba(255,255,255,0.2)]">
              {rows?.map((row, ri) => (
                <tr
                  key={ri}
                  className={clsx(
                    "border-t border-[rgba(255,255,255,0.1)]",
                    onRowClick ? "cursor-pointer hover:text-primary" : ""
                  )}
                  onClick={() => onRowClick && onRowClick(ri)}
                >
                  {row.map((col, ci) => (
                    <td
                      key={`${ri}-${ci}`}
                      className={clsx(
                        "whitespace-nowrap py-4",
                        ci === 0 ? "pl-0" : "pl-6"
                      )}
                    >
                      {ci === 0 ? (
                        col
                      ) : (
                        <div className="flex flex-row justify-end">{col}</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
