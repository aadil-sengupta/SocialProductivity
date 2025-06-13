import {Switch, cn} from "@heroui/react";

interface FormOptionProps {
  title: string;
  description: string;
  isSelected?: boolean;
  onChange?: (selected: boolean) => void;
  disabled?: boolean;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  comingSoon?: boolean;
  comingSoonText?: string;
}

export default function FormOption({
  title,
  description,
  isSelected = false,
  onChange,
  disabled = false,
  className,
  titleClassName,
  descriptionClassName,
  comingSoon = false,
  comingSoonText = "Coming Soon"
}: FormOptionProps) {
  return (
    <div className="relative">
      <Switch
        isSelected={isSelected}
        onValueChange={onChange}
        isDisabled={disabled || comingSoon}
        classNames={{
          base: cn(
            "inline-flex flex-row-reverse w-full max-w-full hover:bg-content1 items-center",
            "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
            "transition-all duration-300",
            comingSoon && "opacity-60 cursor-not-allowed hover:bg-transparent",
            className
          ),
          //wrapper: "p-0 h-4 overflow-visible",
          // thumb: cn(
          //   "w-6 h-6 border-2 shadow-lg",
          //   "group-data-[hover=true]:border-primary",
          //   //selected
          //   "group-data-[selected=true]:ms-6",
          //   // pressed
          //   "group-data-[pressed=true]:w-7",
          //   "group-data-[selected]:group-data-[pressed]:ms-4",
          // ),
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className={cn("text-medium", titleClassName)}>{title}</p>
            {comingSoon && (
              <div className="relative">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  <span className="mr-1">🚀</span>
                  {comingSoonText}
                </span>
                {/* Animated sparkle effect */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
            )}
          </div>
          <p className={cn("text-tiny text-default-400", descriptionClassName)}>
            {comingSoon ? "This feature is currently in development and will be available soon!" : description}
          </p>
        </div>
      </Switch>
      
      {/* Subtle overlay effect for coming soon items */}
      {comingSoon && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none rounded-lg"></div>
      )}
    </div>
  );
}
