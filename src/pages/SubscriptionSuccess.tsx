import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Crown, 
  Sparkles, 
  Gift,
  Star,
  Zap,
  BookOpen,
  MessageSquare,
  Download,
  Heart,
  ArrowRight,
  Home,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [planType, setPlanType] = useState('premium');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Get plan type from URL params (for app store purchases)
    const plan = searchParams.get('plan') || 'premium';
    setPlanType(plan);

    // Celebration animation
    setIsAnimating(true);

    // Show success toast
    toast({
      title: "🎉 Welcome to Premium!",
      description: "All premium features are now unlocked.",
    });

    setTimeout(() => setIsAnimating(false), 3000);
  }, [searchParams, toast]);

  const premiumFeatures = [
    {
      icon: Sparkles,
      title: "Unlimited AI Chat",
      description: "Ask unlimited questions to your AI Bible companion",
      color: "text-purple-500"
    },
    {
      icon: BookOpen,
      title: "Advanced Bible Study",
      description: "Access to all Bible translations and commentaries",
      color: "text-blue-500"
    },
    {
      icon: Download,
      title: "Offline Access",
      description: "Download content for offline Bible study",
      color: "text-green-500"
    },
    {
      icon: Star,
      title: "Premium Templates",
      description: "Exclusive sermon and study templates",
      color: "text-yellow-500"
    },
    {
      icon: Zap,
      title: "Priority Support",
      description: "Get help faster with premium support",
      color: "text-orange-500"
    },
    {
      icon: Heart,
      title: "Ad-Free Experience",
      description: "Enjoy uninterrupted spiritual growth",
      color: "text-red-500"
    }
  ];

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Celebration particles - CSS only */}
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md space-y-6 relative z-20">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className={`w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-all duration-1000 ${
            isAnimating ? 'scale-110 rotate-12' : 'scale-100 rotate-0'
          }`}>
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              🎉 Success!
            </h1>
            <p className="text-gray-600">
              Welcome to Bible Aura Premium
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
              <Crown className="h-4 w-4 mr-2" />
              {planType === 'yearly' ? 'Premium Annual' : 'Premium Monthly'}
            </Badge>
          </div>
        </div>

        {/* Subscription Details */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="text-center">
            <CardTitle className="text-green-700">
              Your Premium Features Are Now Active!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <div className="text-2xl font-bold text-green-600">
                {planType === 'yearly' ? '$49.99/year' : '$9.99/month'}
              </div>
              <p className="text-sm text-gray-600">
                {planType === 'yearly' ? 'Save 58% with annual billing' : 'Monthly subscription active'}
              </p>
              {planType === 'yearly' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <Gift className="h-3 w-3 mr-1" />
                  2 months FREE
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span>What's Unlocked</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {premiumFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-2 rounded-lg transition-all duration-500 hover:bg-gray-50 ${
                  isAnimating ? 'animate-pulse' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{feature.title}</div>
                  <div className="text-sm text-gray-600">{feature.description}</div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            size="lg"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Start Using Premium Features
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Subscription Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h4 className="font-medium text-blue-900">Subscription Details</h4>
              <p className="text-sm text-blue-700">
                Your subscription will automatically renew. You can manage or cancel anytime in your device's app store settings.
              </p>
              <div className="text-xs text-blue-600">
                Next billing: {planType === 'yearly' ? '1 year from today' : '1 month from today'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact us at</p>
          <a 
            href="mailto:support@biblestudy.app" 
            className="text-blue-500 hover:underline"
          >
            support@biblestudy.app
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess; 