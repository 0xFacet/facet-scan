import * as TooltipUi from "./ui/tooltip";

interface Props {
  children: React.ReactNode;
  label: string;
}

export const Tooltip = ({ children, label }: Props) => (
  <TooltipUi.TooltipProvider>
    <TooltipUi.Tooltip>
      <TooltipUi.TooltipTrigger>{children}</TooltipUi.TooltipTrigger>
      <TooltipUi.TooltipContent className="bg-white text-black p-2 mt-2 rounded-md shadow-lg dark:bg-gray-800 dark:text-white">
        {label}
      </TooltipUi.TooltipContent>
    </TooltipUi.Tooltip>
  </TooltipUi.TooltipProvider>
);
