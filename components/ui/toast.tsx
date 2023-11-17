import React from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
};

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return <div className="bg-blue-500">Test</div>;

  // return type === "success" ? (
  //   <div
  //     aria-live="assertive"
  //     className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded shadow-lg transition-all duration-500 ease-in-out"
  //     role="alert"
  //   >
  //     <svg
  //       className=" h-5 w-5 mr-3"
  //       fill="none"
  //       height="24"
  //       stroke="currentColor"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth="2"
  //       viewBox="0 0 24 24"
  //       width="24"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
  //       <polyline points="22 4 12 14.01 9 11.01" />
  //     </svg>
  //     <span>{message}</span>
  //   </div>
  // ) : (
  //   <div
  //     aria-live="assertive"
  //     className="flex items-center bg-red-500 text-white text-sm font-bold px-4 py-3 rounded shadow-lg mt-4 transition-all duration-500 ease-in-out"
  //     role="alert"
  //   >
  //     <svg
  //       className=" h-5 w-5 mr-3"
  //       fill="none"
  //       height="24"
  //       stroke="currentColor"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth="2"
  //       viewBox="0 0 24 24"
  //       width="24"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <circle cx="12" cy="12" r="10" />
  //       <line x1="12" x2="12" y1="8" y2="12" />
  //       <line x1="12" x2="12.01" y1="16" y2="16" />
  //     </svg>
  //     <span>{message}</span>
  //   </div>
  // );
};

export default Toast;
