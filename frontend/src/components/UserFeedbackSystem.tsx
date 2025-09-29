import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Star, MessageCircle, ThumbsUp, ThumbsDown, 
  Send, User, Clock, CheckCircle
} from 'lucide-react';

interface ReviewData {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: string;
  flightRoute: string;
  weatherAccuracy: number;
  helpful: boolean;
  verified: boolean;
}

interface UserFeedbackProps {
  flightRoute: string;
  onFeedbackSubmit?: (feedback: any) => void;
}

const UserFeedbackSystem: React.FC<UserFeedbackProps> = ({ flightRoute, onFeedbackSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [weatherAccuracy, setWeatherAccuracy] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Mock reviews data - in production, this would come from API
  const mockReviews: ReviewData[] = [
    {
      id: '1',
      userId: 'pilot_001',
      userName: 'Captain Smith',
      rating: 5,
      comment: 'Excellent weather briefing! The ML predictions were spot-on for turbulence forecasting. Helped me plan a smoother route.',
      timestamp: '2 hours ago',
      flightRoute: 'KJFK-KLAX',
      weatherAccuracy: 95,
      helpful: true,
      verified: true
    },
    {
      id: '2',
      userId: 'pilot_002',
      userName: 'First Officer Johnson',
      rating: 4,
      comment: 'Great tool for flight planning. The temperature and wind predictions were accurate. Would love to see more detailed icing forecasts.',
      timestamp: '1 day ago',
      flightRoute: 'KORD-KDEN',
      weatherAccuracy: 88,
      helpful: true,
      verified: true
    },
    {
      id: '3',
      userId: 'pilot_003',
      userName: 'Captain Rodriguez',
      rating: 5,
      comment: 'Outstanding platform! The multi-airport routing and weather analysis saved me hours of planning. The risk assessment is very helpful.',
      timestamp: '3 days ago',
      flightRoute: 'EGLL-LFPG-LIRF',
      weatherAccuracy: 92,
      helpful: true,
      verified: true
    }
  ];

  const handleSubmitFeedback = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    const feedbackData = {
      rating,
      comment,
      weatherAccuracy,
      flightRoute,
      timestamp: new Date().toISOString(),
      userId: 'current_user' // In production, get from auth
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onFeedbackSubmit) {
        onFeedbackSubmit(feedbackData);
      }
      
      console.log('Feedback submitted:', feedbackData);
      
      // Reset form
      setRating(0);
      setComment('');
      setWeatherAccuracy(0);
      
      alert('Thank you for your feedback! Your review helps improve our weather predictions.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    readonly = false, 
    size = 'w-6 h-6' 
  }: { 
    value: number; 
    onChange?: (rating: number) => void; 
    readonly?: boolean;
    size?: string;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            className={`${size} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            {star <= value ? (
              <Star className={`${size} fill-yellow-400 text-yellow-400`} />
            ) : (
              <Star className={`${size} text-gray-300`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <MessageCircle className="w-5 h-5" />
            Share Your Flight Experience
          </CardTitle>
          <p className="text-sm text-blue-600">
            Help us improve our weather predictions and flight planning tools
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Experience
            </label>
            <div className="flex items-center gap-2">
              <StarRating value={rating} onChange={setRating} />
              <span className="text-sm text-gray-600 ml-2">
                {rating > 0 && `${rating}/5 stars`}
              </span>
            </div>
          </div>

          {/* Weather Accuracy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather Prediction Accuracy
            </label>
            <div className="flex items-center gap-2">
              <StarRating value={weatherAccuracy} onChange={setWeatherAccuracy} />
              <span className="text-sm text-gray-600 ml-2">
                {weatherAccuracy > 0 && `${weatherAccuracy}/5 stars`}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments & Suggestions
            </label>
            <Textarea
              placeholder="Share details about weather accuracy, flight planning experience, or suggestions for improvement..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Route: {flightRoute}
            </Badge>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={rating === 0 || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Pilot Reviews & Feedback
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReviews(!showReviews)}
            >
              {showReviews ? 'Hide Reviews' : `View Reviews (${mockReviews.length})`}
            </Button>
          </div>
        </CardHeader>
        
        {showReviews && (
          <CardContent>
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{review.userName}</p>
                          {review.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {review.timestamp}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {review.flightRoute}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Overall:</span>
                      <StarRating value={review.rating} readonly size="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Weather Accuracy:</span>
                      <StarRating value={review.weatherAccuracy} readonly size="w-4 h-4" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Helpful
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Not Helpful
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default UserFeedbackSystem;