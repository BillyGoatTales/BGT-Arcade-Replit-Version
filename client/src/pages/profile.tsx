import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { FaUser, FaCamera, FaSave, FaEnvelope, FaSignOutAlt, FaUpload, FaTrash } from "react-icons/fa";
import { Link } from "wouter";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    username: (user as any)?.username || '',
    firstName: (user as any)?.firstName || '',
    lastName: (user as any)?.lastName || '',
    profileImageUrl: (user as any)?.profileImageUrl || '',
    bio: (user as any)?.bio || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', '/api/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (jpg, png, gif)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleInputChange('profileImageUrl', result);
      toast({
        title: "Image Uploaded",
        description: "Profile image has been updated successfully!",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-purple via-midnight-blue to-electric-purple flex items-center justify-center">
        <div className="text-neon-cyan font-pixel text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-purple via-midnight-blue to-electric-purple flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-pixel text-2xl text-neon-cyan mb-4">Access Denied</h1>
          <Link href="/auth">
            <Button className="arcade-button">
              Login to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple via-midnight-blue to-electric-purple overflow-hidden">
      {/* Header */}
      <header className="border-b-4 border-neon-cyan bg-arcade-dark/80 backdrop-blur-sm">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <Link href="/">
              <Button variant="ghost" className="text-neon-cyan font-pixel hover:text-neon-yellow text-xs sm:text-sm">
                ← BACK TO GAMES
              </Button>
            </Link>
            <h1 className="font-pixel text-lg sm:text-2xl text-neon-cyan text-center">
              PLAYER PROFILE
            </h1>
            <div className="w-0 sm:w-32"></div>
          </div>
        </div>
      </header>

      <main className="w-full px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto w-full">
          {/* Profile Card */}
          <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-cyan rounded-lg p-4 sm:p-8 crt-effect w-full">
            
            {/* Profile Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative inline-block mb-4">
                <div 
                  className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-neon-green/20 to-neon-yellow/20 rounded-full border-4 ${
                    isDragging ? 'border-neon-cyan border-dashed' : 'border-neon-green'
                  } flex items-center justify-center mx-auto cursor-pointer hover:border-neon-cyan transition-colors group relative overflow-hidden`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {formData.profileImageUrl ? (
                    <img 
                      src={formData.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover group-hover:opacity-80 transition-opacity"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        handleInputChange('profileImageUrl', '');
                      }}
                    />
                  ) : (
                    <FaUser className="text-neon-yellow text-2xl sm:text-3xl group-hover:text-neon-cyan transition-colors" />
                  )}
                  
                  {/* Overlay for edit indication */}
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FaUpload className="text-white text-lg" />
                  </div>

                  {/* Drag overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-neon-cyan/20 rounded-full flex items-center justify-center">
                      <FaUpload className="text-neon-cyan text-lg animate-bounce" />
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <p className="text-xs text-neon-cyan/70 mt-2">
                  Click to upload or drag & drop an image
                </p>
              </div>
              
              <h2 className="font-pixel text-2xl text-neon-magenta mb-2">
                {user.username.toUpperCase()}
              </h2>
              
              {!user.emailVerified && user.email && (
                <div className="bg-orange-500/20 border border-orange-400 rounded p-3 mb-4">
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <FaEnvelope />
                    <span>Email verification pending. Check your inbox!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="w-full">
                  <Label htmlFor="username" className="text-neon-cyan font-pixel text-xs sm:text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="bg-black/40 border-neon-cyan text-white text-sm w-full"
                    placeholder="Enter username"
                  />
                </div>

                <div className="w-full">
                  <Label htmlFor="email" className="text-neon-cyan font-pixel text-xs sm:text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={(user as any)?.email || ''}
                    disabled
                    className="bg-black/40 border-gray-600 text-gray-400 text-sm w-full"
                    placeholder="Email (OAuth managed)"
                  />
                </div>

                <div className="w-full">
                  <Label htmlFor="firstName" className="text-neon-cyan font-pixel text-xs sm:text-sm">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-black/40 border-neon-cyan text-white text-sm w-full"
                    placeholder="Enter first name"
                  />
                </div>

                <div className="w-full">
                  <Label htmlFor="lastName" className="text-neon-cyan font-pixel text-xs sm:text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-black/40 border-neon-cyan text-white text-sm w-full"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="w-full">
                <Label className="text-neon-cyan font-pixel text-xs sm:text-sm">
                  Profile Image
                </Label>
                <div className="space-y-3">
                  {/* Upload Area */}
                  <div 
                    className={`border-2 border-dashed ${
                      isDragging ? 'border-neon-cyan bg-neon-cyan/10' : 'border-neon-cyan/40'
                    } rounded-lg p-4 text-center cursor-pointer hover:border-neon-cyan hover:bg-neon-cyan/5 transition-all`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <FaUpload className="mx-auto text-neon-cyan text-2xl mb-2" />
                    <p className="text-neon-cyan text-sm">
                      {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-neon-cyan/60 text-xs mt-1">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan border border-neon-cyan text-xs py-1 px-3 rounded"
                    >
                      <FaUpload className="mr-1" />
                      Upload Image
                    </Button>
                    {formData.profileImageUrl && (
                      <Button
                        type="button"
                        onClick={() => handleInputChange('profileImageUrl', '')}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400 text-xs py-1 px-3 rounded"
                      >
                        <FaTrash className="mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {/* Optional URL input */}
                  <details className="text-xs">
                    <summary className="text-neon-cyan/70 cursor-pointer hover:text-neon-cyan">
                      Or enter image URL manually
                    </summary>
                    <Input
                      value={formData.profileImageUrl}
                      onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                      className="bg-black/40 border-neon-cyan text-white text-sm w-full mt-2"
                      placeholder="https://example.com/image.jpg"
                    />
                  </details>
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="bio" className="text-neon-cyan font-pixel text-xs sm:text-sm">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-black/40 border-neon-cyan text-white text-sm w-full resize-none"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-neon-cyan/70 mt-1">
                  {formData.bio.length}/500 characters
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="arcade-button flex-1 font-pixel text-sm sm:text-lg py-2 sm:py-3"
                >
                  <FaSave className="mr-2" />
                  {updateProfileMutation.isPending ? 'SAVING...' : 'SAVE PROFILE'}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => {
                    fetch('/api/auth/logout', { method: 'POST' })
                      .then(() => window.location.href = '/auth');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-pixel text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-6 border-4 border-red-400 rounded transition-all"
                >
                  <FaSignOutAlt className="mr-2" />
                  LOGOUT
                </Button>
              </div>
            </form>

            {/* Stats Section */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-neon-cyan/30 w-full">
              <h3 className="font-pixel text-sm sm:text-lg text-neon-cyan mb-3 sm:mb-4 text-center">GAMING STATS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-center">
                <div className="bg-black/40 rounded p-3 sm:p-4">
                  <div className="font-pixel text-lg sm:text-2xl text-neon-yellow">
                    {(user as any)?.totalScore?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs sm:text-sm text-neon-cyan">Total Score</div>
                </div>
                <div className="bg-black/40 rounded p-3 sm:p-4">
                  <div className="font-pixel text-lg sm:text-2xl text-neon-magenta">
                    {(user as any)?.emailVerified ? 'VERIFIED' : 'PENDING'}
                  </div>
                  <div className="text-xs sm:text-sm text-neon-cyan">Email Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}