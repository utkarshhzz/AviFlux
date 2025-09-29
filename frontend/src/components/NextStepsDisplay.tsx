import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, AlertTriangle, Info, ArrowRight, 
  Plane, MapPin, Clock, Fuel, Route 
} from 'lucide-react';

interface NextStepsProps {
  mlModelOutput?: any;
  weatherData?: any;
  routeInfo?: any;
}

const NextStepsDisplay: React.FC<NextStepsProps> = ({ mlModelOutput, weatherData, routeInfo }) => {
  // Generate next steps based on ML model recommendations and weather conditions
  const generateNextSteps = () => {
    const steps = [];
    
    // Weather-based recommendations
    if (weatherData?.risk_assessment?.overall_risk > 70) {
      steps.push({
        id: 'weather_delay',
        type: 'warning',
        priority: 'high',
        title: 'Consider Flight Delay',
        description: 'High weather risk detected. Consider delaying departure by 2-4 hours.',
        action: 'Review updated forecasts and consult with dispatch',
        estimated_time: '30 minutes',
        icon: AlertTriangle
      });
    }

    // Route optimization
    if (routeInfo?.distance_nm > 1500) {
      steps.push({
        id: 'fuel_planning',
        type: 'info',
        priority: 'medium',
        title: 'Extended Fuel Planning',
        description: 'Long-distance flight detected. Verify fuel requirements and alternate airports.',
        action: 'Calculate fuel reserves and identify suitable alternates',
        estimated_time: '20 minutes',
        icon: Fuel
      });
    }

    // ML model specific recommendations
    if (mlModelOutput?.predictions?.includes('turbulence')) {
      steps.push({
        id: 'turbulence_brief',
        type: 'warning',
        priority: 'high',
        title: 'Turbulence Briefing',
        description: 'Moderate to severe turbulence predicted along route.',
        action: 'Brief cabin crew and secure cabin for turbulent conditions',
        estimated_time: '15 minutes',
        icon: Plane
      });
    }

    // Standard pre-flight steps
    steps.push({
      id: 'weather_update',
      type: 'info',
      priority: 'medium',
      title: 'Final Weather Update',
      description: 'Obtain latest weather briefing 1 hour before departure.',
      action: 'Check TAF/METAR updates for departure and arrival airports',
      estimated_time: '10 minutes',
      icon: Info
    });

    steps.push({
      id: 'notam_check',
      type: 'info',
      priority: 'medium',
      title: 'NOTAM Review',
      description: 'Review current NOTAMs for route and destination airports.',
      action: 'Check for runway closures, navigation aid outages, and airspace restrictions',
      estimated_time: '15 minutes',
      icon: MapPin
    });

    steps.push({
      id: 'flight_plan_file',
      type: 'success',
      priority: 'high',
      title: 'File Flight Plan',
      description: 'Submit flight plan to ATC with current route and weather considerations.',
      action: 'File via DUATS or through dispatch services',
      estimated_time: '10 minutes',
      icon: Route
    });

    // Risk-based additional steps
    if (weatherData?.weather_summary?.departure?.flight_category === 'LIFR') {
      steps.push({
        id: 'alternate_planning',
        type: 'warning',
        priority: 'high',
        title: 'Alternate Airport Planning',
        description: 'Low IFR conditions at departure. Ensure suitable alternates are available.',
        action: 'Identify and brief suitable alternate airports with better weather',
        estimated_time: '20 minutes',
        icon: MapPin
      });
    }

    return steps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const nextSteps = generateNextSteps();

  const getStepVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'success': return 'default';
      case 'info': 
      default: return 'secondary';
    }
  };

  const getStepBorderColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-red-200 bg-red-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': 
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTotalEstimatedTime = () => {
    return nextSteps.reduce((total, step) => {
      const time = parseInt(step.estimated_time.match(/\d+/)?.[0] || '0');
      return total + time;
    }, 0);
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <CheckCircle className="w-6 h-6" />
          Recommended Next Steps
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-indigo-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Total estimated time: {getTotalEstimatedTime()} minutes
          </div>
          <Badge variant="outline" className="text-indigo-600 border-indigo-200">
            {nextSteps.filter(s => s.priority === 'high').length} High Priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nextSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.id} 
                className={`border rounded-lg p-4 ${getStepBorderColor(step.type)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      step.type === 'warning' ? 'bg-red-500' :
                      step.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <Badge variant={getStepVariant(step.type)} className="text-xs">
                        {step.priority.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{step.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ArrowRight className="w-4 h-4" />
                        <span className="font-medium">Action:</span>
                        <span>{step.action}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {step.estimated_time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-indigo-200">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Complete
          </Button>
          <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
            Export Checklist
          </Button>
          <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
            Share with Crew
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextStepsDisplay;