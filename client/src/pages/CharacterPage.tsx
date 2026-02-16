import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, User, Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import CharacterCreator from '@/components/CharacterCreator';
import { useToast } from '@/hooks/use-toast';

interface CharacterData {
  skinTone: string;
  hairStyle: number;
  hairColor: string;
  eyeColor: string;
  outfit: number;
  outfitColor: string;
  accessory: number;
  accessoryColor: string;
  sprite?: string;
}

export default function CharacterPage() {
  const [showCreator, setShowCreator] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data including character
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Save character mutation
  const saveCharacterMutation = useMutation({
    mutationFn: async (characterData: CharacterData & { sprite: string }) => {
      const response = await fetch('/api/user/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to save character');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setShowCreator(false);
      toast({
        title: "Character Saved!",
        description: "Your 8-bit avatar has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveCharacter = (characterData: CharacterData & { sprite: string }) => {
    saveCharacterMutation.mutate(characterData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-200">Loading character data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Character Customization
            </h1>
          </div>
          <Badge variant="outline" className="border-purple-400/50 text-purple-300">
            8-bit Style
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Current Character Display */}
          <Card className="bg-black/40 border-cyan-400/30">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                Current Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(user as any)?.characterSprite ? (
                <div className="text-center space-y-4">
                  <div className="bg-gray-800 rounded-lg p-6 border border-cyan-400/20">
                    <img
                      src={(user as any).characterSprite}
                      alt="Character Avatar"
                      className="mx-auto pixel-art"
                      style={{ 
                        imageRendering: 'pixelated',
                        width: '120px',
                        height: '180px'
                      }}
                    />
                  </div>
                  <div className="text-cyan-200">
                    <p className="font-medium">{(user as any).username}'s Avatar</p>
                    <p className="text-sm text-gray-400">8-bit Arcade Character</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gray-800 rounded-lg p-8 border border-dashed border-gray-600">
                    <User className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400 mb-2">No character created yet</p>
                    <p className="text-sm text-gray-500">Create your personalized 8-bit avatar</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowCreator(true)}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                <Palette className="w-4 h-4 mr-2" />
                {(user as any)?.characterSprite ? 'Edit Character' : 'Create Character'}
              </Button>
            </CardContent>
          </Card>

          {/* Character Features */}
          <Card className="bg-black/40 border-purple-400/30">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Character Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
                  <div>
                    <h4 className="font-medium text-cyan-300">Authentic 8-bit Pixel Art</h4>
                    <p className="text-sm text-gray-400">Retro arcade-style character design</p>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/50">Premium</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <div>
                    <h4 className="font-medium text-purple-300">Full Customization</h4>
                    <p className="text-sm text-gray-400">Skin tone, hair, clothing, accessories</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/50">Included</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                  <div>
                    <h4 className="font-medium text-blue-300">Profile Integration</h4>
                    <p className="text-sm text-gray-400">Display on leaderboards and games</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/50">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30">
                  <div>
                    <h4 className="font-medium text-green-300">Downloadable Sprite</h4>
                    <p className="text-sm text-gray-400">Export your character as PNG</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/50">Available</Badge>
                </div>
              </div>

              {(user as any)?.characterData && (
                <div className="mt-6 p-4 rounded-lg bg-black/30 border border-gray-600">
                  <h4 className="font-medium text-gray-300 mb-2">Character Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">
                      Hair: <span className="text-cyan-300">Style {(user as any).characterData.hairStyle + 1}</span>
                    </div>
                    <div className="text-gray-400">
                      Outfit: <span className="text-purple-300">Style {(user as any).characterData.outfit + 1}</span>
                    </div>
                    <div className="text-gray-400">
                      Eyes: <span className="text-blue-300">Custom Color</span>
                    </div>
                    <div className="text-gray-400">
                      Accessory: <span className="text-pink-300">
                        {(user as any).characterData.accessory === 0 ? 'None' : `Style ${(user as any).characterData.accessory}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Character Gallery (Future Feature) */}
        <Card className="mt-8 bg-black/40 border-gray-600">
          <CardHeader>
            <CardTitle className="text-xl text-gray-400">Character Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 mb-2">Community Character Gallery</p>
              <p className="text-sm text-gray-600">Coming soon: Browse and share character creations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Character Creator Modal */}
      {showCreator && (
        <CharacterCreator
          onSave={handleSaveCharacter}
          onClose={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}