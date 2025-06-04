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
}

export default function FormOption({
  title,
  description,
  isSelected = false,
  onChange,
  disabled = false,
  className,
  titleClassName,
  descriptionClassName
}: FormOptionProps) {
  return (
    <Switch
      isSelected={isSelected}
      onValueChange={onChange}
      isDisabled={disabled}
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full max-w-full  hover:bg-content1 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
          
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
        <p className={cn("text-medium", titleClassName)}>{title}</p>
        <p className={cn("text-tiny text-default-400", descriptionClassName)}>
          {description}
        </p>
      </div>
    </Switch>
  );
}
