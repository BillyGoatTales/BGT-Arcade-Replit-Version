import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FaBug, FaGamepad, FaLightbulb, FaComments, FaPaperPlane } from 'react-icons/fa';


const feedbackTypes = [
  { value: 'bug_report', label: 'Bug Report', icon: FaBug, description: 'Report a game error or technical issue' },
  { value: 'game_request', label: 'Game Request', icon: FaGamepad, description: 'Request a new game to be added' },
  { value: 'suggestion', label: 'Suggestion', icon: FaLightbulb, description: 'Suggest improvements or new features' },
  { value: 'general', label: 'General Feedback', icon: FaComments, description: 'Share your thoughts about the platform' },
];

const priorityLevels = [
  { value: 'low', label: 'Low Priority', color: 'text-green-400' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-400' },
  { value: 'high', label: 'High Priority', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });

      // Reset form
      setFormData({
        type: '',
        title: '',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 border-neon-cyan">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Authentication Required</CardTitle>
            <CardDescription className="text-gray-300">
              Please log in to submit feedback
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Share Your Feedback</h1>
          <p className="text-xl text-gray-300">
            Help us improve Billy Goat Arcade by reporting issues, requesting games, or sharing suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {feedbackTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.type === type.value;
            return (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  isSelected 
                    ? 'bg-neon-cyan/20 border-neon-cyan shadow-lg shadow-neon-cyan/25' 
                    : 'bg-black/40 border-gray-600 hover:border-neon-cyan/50'
                }`}
                onClick={() => handleInputChange('type', type.value)}
              >
                <CardHeader className="text-center">
                  <Icon className={`mx-auto text-3xl mb-2 ${isSelected ? 'text-neon-cyan' : 'text-gray-400'}`} />
                  <CardTitle className={`text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {type.label}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-400">
                    {type.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className="bg-black/40 border-neon-cyan">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FaPaperPlane className="mr-3 text-neon-cyan" />
              Submit Feedback
            </CardTitle>
            <CardDescription className="text-gray-300">
              Please provide detailed information to help us understand your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Priority Level
                </label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="bg-black/40 border-neon-cyan text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-neon-cyan">
                    {priorityLevels.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-black/40 border-neon-cyan text-white"
                  placeholder="Brief summary of your feedback"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200 characters</p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-black/40 border-neon-cyan text-white min-h-[120px]"
                  placeholder="Please provide detailed information about your feedback. For bug reports, include steps to reproduce the issue."
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/2000 characters</p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.type || !formData.title || !formData.description}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-semibold px-8 py-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Your feedback helps us create a better gaming experience for everyone. 
            We review all submissions and appreciate your input!
          </p>
        </div>
      </div>
    </div>
  );
}