import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Palette, Download, Shuffle, Save } from 'lucide-react';

interface CharacterData {
  skinTone: string;
  hairStyle: number;
  hairColor: string;
  eyeColor: string;
  outfit: number;
  outfitColor: string;
  accessory: number;
  accessoryColor: string;
}

const SKIN_TONES = [
  '#FFE0BD', '#FFCD94', '#EDB98A', '#E8B982', '#E8A16C',
  '#DB9065', '#CE7238', '#C9695B', '#B86F50', '#A0522D'
];

const HAIR_COLORS = [
  '#2C1B18', '#8B4513', '#D2691E', '#CD853F', '#F4A460',
  '#FFD700', '#FF6347', '#8A2BE2', '#FF1493', '#00CED1'
];

const EYE_COLORS = [
  '#8B4513', '#32CD32', '#1E90FF', '#9932CC', '#FF1493',
  '#FFD700', '#FF6347', '#00CED1', '#228B22', '#8B008B'
];

const OUTFIT_COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
  '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'
];

export default function CharacterCreator({ onSave, onClose }: {
  onSave: (character: CharacterData & { sprite: string }) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [character, setCharacter] = useState<CharacterData>({
    skinTone: SKIN_TONES[2],
    hairStyle: 0,
    hairColor: HAIR_COLORS[0],
    eyeColor: EYE_COLORS[0],
    outfit: 0,
    outfitColor: OUTFIT_COLORS[0],
    accessory: 0,
    accessoryColor: OUTFIT_COLORS[4]
  });

  const [currentTab, setCurrentTab] = useState('appearance');

  // 8-bit pixel art drawing functions
  const drawPixel = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 4) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
  };

  const drawCharacter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelSize = 6;
    canvas.width = 16 * pixelSize;
    canvas.height = 24 * pixelSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // Draw head (skin tone)
    for (let x = 5; x <= 10; x++) {
      for (let y = 2; y <= 7; y++) {
        if ((x === 5 || x === 10) && (y === 2 || y === 7)) continue;
        drawPixel(ctx, x, y, character.skinTone, pixelSize);
      }
    }

    // Draw hair based on style
    const hairPatterns = [
      // Style 0: Short hair
      [[6, 1], [7, 1], [8, 1], [9, 1], [5, 2], [10, 2], [5, 3], [10, 3]],
      // Style 1: Long hair
      [[5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [4, 2], [11, 2], [4, 3], [11, 3], [4, 4], [11, 4]],
      // Style 2: Spiky hair
      [[6, 0], [8, 0], [5, 1], [7, 1], [9, 1], [10, 1], [5, 2], [10, 2]],
      // Style 3: Curly hair
      [[5, 1], [6, 1], [9, 1], [10, 1], [4, 2], [7, 2], [8, 2], [11, 2], [5, 3], [10, 3]]
    ];

    hairPatterns[character.hairStyle]?.forEach(([x, y]) => {
      drawPixel(ctx, x, y, character.hairColor, pixelSize);
    });

    // Draw eyes
    drawPixel(ctx, 6, 4, character.eyeColor, pixelSize);
    drawPixel(ctx, 9, 4, character.eyeColor, pixelSize);

    // Draw nose (small pixel)
    drawPixel(ctx, 7, 5, '#FFA07A', pixelSize);

    // Draw mouth
    drawPixel(ctx, 7, 6, '#FF69B4', pixelSize);
    drawPixel(ctx, 8, 6, '#FF69B4', pixelSize);

    // Draw body (outfit)
    const outfitPatterns = [
      // Outfit 0: T-shirt
      [[6, 8], [7, 8], [8, 8], [9, 8], [5, 9], [10, 9], [5, 10], [10, 10], [5, 11], [10, 11]],
      // Outfit 1: Hoodie
      [[5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [4, 9], [11, 9], [4, 10], [11, 10], [5, 11], [10, 11]],
      // Outfit 2: Tank top
      [[6, 8], [7, 8], [8, 8], [9, 8], [6, 9], [9, 9], [6, 10], [9, 10], [6, 11], [9, 11]],
      // Outfit 3: Jacket
      [[4, 8], [5, 8], [10, 8], [11, 8], [4, 9], [11, 9], [5, 10], [10, 10], [5, 11], [10, 11]]
    ];

    outfitPatterns[character.outfit]?.forEach(([x, y]) => {
      drawPixel(ctx, x, y, character.outfitColor, pixelSize);
    });

    // Draw arms (skin tone)
    [[4, 9], [11, 9], [3, 10], [12, 10], [3, 11], [12, 11]].forEach(([x, y]) => {
      drawPixel(ctx, x, y, character.skinTone, pixelSize);
    });

    // Draw legs (darker outfit color for pants)
    const pantColor = character.outfitColor === '#000000' ? '#333333' : '#000080';
    [[6, 12], [7, 12], [8, 12], [9, 12], [6, 13], [9, 13], [6, 14], [9, 14], 
     [6, 15], [9, 15], [6, 16], [9, 16]].forEach(([x, y]) => {
      drawPixel(ctx, x, y, pantColor, pixelSize);
    });

    // Draw accessories
    const accessoryPatterns = [
      // Accessory 0: None
      [],
      // Accessory 1: Hat
      [[5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [4, 1], [11, 1]],
      // Accessory 2: Glasses
      [[5, 4], [6, 4], [8, 4], [9, 4], [7, 4]],
      // Accessory 3: Necklace
      [[6, 7], [7, 7], [8, 7], [9, 7]]
    ];

    accessoryPatterns[character.accessory]?.forEach(([x, y]) => {
      drawPixel(ctx, x, y, character.accessoryColor, pixelSize);
    });
  };

  useEffect(() => {
    drawCharacter();
  }, [character]);

  const randomizeCharacter = () => {
    setCharacter({
      skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
      hairStyle: Math.floor(Math.random() * 4),
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
      outfit: Math.floor(Math.random() * 4),
      outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
      accessory: Math.floor(Math.random() * 4),
      accessoryColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)]
    });
  };

  const saveCharacter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const spriteData = canvas.toDataURL('image/png');
    onSave({ ...character, sprite: spriteData });
  };

  const downloadSprite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'character-sprite.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-cyan-400/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Character Creation Wizard
          </CardTitle>
          <p className="text-cyan-200">Design your 8-bit arcade avatar</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Character Preview */}
            <div className="space-y-4">
              <div className="bg-black/40 rounded-lg p-6 border border-cyan-400/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">Preview</h3>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-cyan-400/40 rounded bg-gray-800"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={randomizeCharacter}
                  variant="outline"
                  className="flex-1 border-purple-400/50 text-purple-300 hover:bg-purple-400/20"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Randomize
                </Button>
                <Button
                  onClick={downloadSprite}
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Customization Panel */}
            <div className="space-y-4">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3 bg-black/40">
                  <TabsTrigger value="appearance" className="text-xs">Appearance</TabsTrigger>
                  <TabsTrigger value="clothing" className="text-xs">Clothing</TabsTrigger>
                  <TabsTrigger value="accessories" className="text-xs">Accessories</TabsTrigger>
                </TabsList>

                <TabsContent value="appearance" className="space-y-4">
                  {/* Skin Tone */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Skin Tone</label>
                    <div className="grid grid-cols-5 gap-2">
                      {SKIN_TONES.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setCharacter({ ...character, skinTone: color })}
                          className={`w-8 h-8 rounded border-2 ${
                            character.skinTone === color ? 'border-cyan-400' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hair Style */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Hair Style</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Short', 'Long', 'Spiky', 'Curly'].map((style, index) => (
                        <Button
                          key={index}
                          onClick={() => setCharacter({ ...character, hairStyle: index })}
                          variant={character.hairStyle === index ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Hair Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {HAIR_COLORS.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setCharacter({ ...character, hairColor: color })}
                          className={`w-8 h-8 rounded border-2 ${
                            character.hairColor === color ? 'border-cyan-400' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Eye Color */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Eye Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {EYE_COLORS.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setCharacter({ ...character, eyeColor: color })}
                          className={`w-8 h-8 rounded border-2 ${
                            character.eyeColor === color ? 'border-cyan-400' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clothing" className="space-y-4">
                  {/* Outfit Style */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Outfit Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['T-Shirt', 'Hoodie', 'Tank Top', 'Jacket'].map((style, index) => (
                        <Button
                          key={index}
                          onClick={() => setCharacter({ ...character, outfit: index })}
                          variant={character.outfit === index ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Color */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Outfit Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {OUTFIT_COLORS.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setCharacter({ ...character, outfitColor: color })}
                          className={`w-8 h-8 rounded border-2 ${
                            character.outfitColor === color ? 'border-cyan-400' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="accessories" className="space-y-4">
                  {/* Accessory Type */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Accessory</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['None', 'Hat', 'Glasses', 'Necklace'].map((accessory, index) => (
                        <Button
                          key={index}
                          onClick={() => setCharacter({ ...character, accessory: index })}
                          variant={character.accessory === index ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {accessory}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Accessory Color */}
                  <div>
                    <label className="text-sm font-medium text-cyan-300 mb-2 block">Accessory Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {OUTFIT_COLORS.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setCharacter({ ...character, accessoryColor: color })}
                          className={`w-8 h-8 rounded border-2 ${
                            character.accessoryColor === color ? 'border-cyan-400' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-cyan-400/20">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-500 text-gray-300 hover:bg-gray-500/20"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCharacter}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Character
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}