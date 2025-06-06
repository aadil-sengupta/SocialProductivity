
import { useAccentColorManager } from '@/contexts/AccentColorContext';
import { cn } from '@heroui/react';

interface ColorPickerProps {
  className?: string;
}

function capitalizeFirstLetter(val?: string) { // val is string
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function ColorPicker({ className }: ColorPickerProps) {
  const { accentColor, setAccentColor, presetColors } = useAccentColorManager();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h4 className="text-medium font-semibold">Accent Color</h4>
      <div className="grid grid-cols-6 gap-2">
        {Object.entries(presetColors).map(([name, color]) => (
          <button
            key={name}
            onClick={() => setAccentColor(color)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all duration-200",
              "hover:scale-110 focus:scale-110 focus:outline-none",
              accentColor === color 
                ? "border-white shadow-lg ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600" 
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            )}
            style={{ backgroundColor: color, margin: '0 auto' }}
            title={name.charAt(0).toUpperCase() + name.slice(1)}
            aria-label={`Select ${name} color`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-small text-gray-600 dark:text-gray-400">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: accentColor }}
        />
        <span>Current: {capitalizeFirstLetter(Object.entries(presetColors).find(([_, color]) => color === accentColor)?.[0]) || 'Custom'}</span>
      </div>
    </div>
  );
}
