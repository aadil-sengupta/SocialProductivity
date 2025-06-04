import { useAccentColorManager, useAccentColor } from '@/contexts/AccentColorContext';
import { Button } from '@heroui/button';
import { Card, CardBody, Badge } from '@heroui/react';

/**
 * Example component demonstrating various ways to use accent colors throughout the application.
 * This showcases different methods for referencing and applying the user's chosen accent color.
 */
export default function AccentColorExamples() {
  const { accentColor, colorVariations } = useAccentColorManager();
  const accentClasses = useAccentColor();

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Accent Color Usage Examples</h2>
      
      {/* Method 1: Using Tailwind CSS Classes */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Method 1: Tailwind CSS Classes</h3>
        <div className="flex gap-4 flex-wrap">
          <Button className="bg-accent hover:bg-accent-600 text-accent-foreground">
            Primary Button
          </Button>
          <Button variant="bordered" className="border-accent text-accent hover:bg-accent-50">
            Bordered Button
          </Button>
          <div className="px-4 py-2 bg-accent-100 text-accent-900 rounded-lg">
            Accent Background
          </div>
          <Badge className="bg-accent text-accent-foreground">
            Badge with Accent
          </Badge>
        </div>
        <div className="text-accent text-sm">
          Use classes like: bg-accent, text-accent, border-accent, bg-accent-100, etc.
        </div>
      </section>

      {/* Method 2: Using CSS Custom Properties */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Method 2: CSS Custom Properties</h3>
        <div className="flex gap-4 flex-wrap">
          <div 
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--accent-DEFAULT)' }}
          >
            Using CSS Variables
          </div>
          <div 
            className="px-4 py-2 rounded-lg border-2"
            style={{ 
              borderColor: 'var(--accent-DEFAULT)', 
              color: 'var(--accent-DEFAULT)',
              backgroundColor: 'var(--accent-50)'
            }}
          >
            Multiple CSS Variables
          </div>
        </div>
        <div className="text-gray-600 text-sm">
          Use CSS variables: var(--accent-DEFAULT), var(--accent-50), var(--accent-600), etc.
        </div>
      </section>

      {/* Method 3: Using the Theme Context Directly */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Method 3: Theme Context Values</h3>
        <div className="flex gap-4 flex-wrap">
          <div 
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: accentColor }}
          >
            Direct Theme Value
          </div>
          <div 
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: colorVariations[100],
              color: colorVariations[800],
              border: `2px solid ${colorVariations[300]}`
            }}
          >
            Color Variations
          </div>
        </div>
        <div className="text-gray-600 text-sm">
          Use: accentColor, colorVariations[100], colorVariations[600], etc.
        </div>
      </section>

      {/* Method 4: Using the Accent Color Hook */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Method 4: Accent Color Hook</h3>
        <div className="flex gap-4 flex-wrap">
          <Button className={`${accentClasses.bg} ${accentClasses.text} hover:bg-accent-600`}>
            Hook Classes
          </Button>
          <div className={`px-4 py-2 rounded-lg ${accentClasses.bgLight} ${accentClasses.textDark}`}>
            Light Background
          </div>
        </div>
        <div className="text-gray-600 text-sm">
          Use: accentClasses.bg, accentClasses.text, accentClasses.border, etc.
        </div>
      </section>

      {/* Method 5: HeroUI Component Integration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Method 5: HeroUI Components</h3>
        <div className="flex gap-4 flex-wrap">
          <Button color="primary">
            HeroUI Primary (Auto-styled)
          </Button>
          <Card className="w-64">
            <CardBody className="text-center">
              <p className="text-accent font-semibold">Card with Accent Text</p>
              <p className="text-sm text-gray-600">HeroUI components automatically use the primary color</p>
            </CardBody>
          </Card>
        </div>
        <div className="text-gray-600 text-sm">
          HeroUI components automatically use the primary color which is linked to your accent color.
        </div>
      </section>

      {/* Color Palette Display */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Current Color Palette</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(colorVariations).map(([key, value]) => (
            typeof value === 'string' && (
              <div key={key} className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg border border-gray-300 mx-auto mb-2"
                  style={{ backgroundColor: value }}
                />
                <div className="text-xs font-mono">{key}</div>
                <div className="text-xs text-gray-500 font-mono">{value}</div>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  );
}
