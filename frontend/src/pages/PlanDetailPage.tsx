import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FlightPlanSummary from "@/components/FlightPlanSummary";
import WeatherBriefingDisplay from "@/components/WeatherBriefingDisplay";
import RouteMap from "@/components/RouteMap";
import FlightPathMap from "@/components/FlightPathMap";
import WeatherGraphicsDisplay from "@/components/WeatherGraphicsDisplay";
import UserFeedbackSystem from "@/components/UserFeedbackSystem";
import NextStepsDisplay from "@/components/NextStepsDisplay";
import RouteVisualizationPage from "@/components/RouteVisualizationPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader } from "@/components/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Map, 
  CloudRain, 
  Navigation, 
  BarChart3, 
  Settings, 
  Download,
  Share2,
  Clock,
  Fuel,
  Route,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Plane,
  MapPin
} from "lucide-react";

type Plan = {
    plan_id: string;
    route: string[];
    summary: string[];
    risk_index: string;
} | null;

// Sample Data
const flightPlan = {
    success: true,
    message: "Flight plan generated successfully",
    data: {
        plan_id: "40de5b60-628d-4cc6-a15f-f3c8b27b150f",
        generated_at: "2025-09-26T17:52:26.476475",
        route: {
            airports: ["VIDP", "VOBL"],
            departure_time: "2025-09-25T12:00:00Z",
            distance_nm: 918.8,
            estimated_time_min: 122,
        },
        summary: {
            text: ["No significant weather hazards identified"],
            risk_index: "green",
        },
        risks: [],
        map_layers: {
            route: {
                type: "LineString",
                coordinates: [
                    [77.09519, 28.55563],
                    [77.10210002562799, 28.40066373430545],
                    [77.10898997386992, 28.245693591931484],
                    [77.11586003190766, 28.090719588543646],
                    [77.12271038527095, 27.93574173988342],
                    [77.12954121785918, 27.78076006176828],
                    [77.13635271196277, 27.625774570091707],
                    [77.14314504828432, 27.47078528082314],
                    [77.14991840595938, 27.31579221000804],
                    [77.15667296257703, 27.160795373767822],
                    [77.16340889420009, 27.005794788299852],
                    [77.17012637538502, 26.850790469877413],
                    [77.17682557920168, 26.695782434849683],
                    [77.18350667725261, 26.540770699641644],
                    [77.19016983969223, 26.385755280754104],
                    [77.19681523524568, 26.23073619476354],
                    [77.20344303122737, 26.0757134583221],
                    [77.21005339355932, 25.92068708815749],
                    [77.21664648678929, 25.76565710107291],
                    [77.22322247410858, 25.610623513946944],
                    [77.22978151736957, 25.455586343733465],
                    [77.23632377710318, 25.300545607461544],
                    [77.24284941253586, 25.145501322235294],
                    [77.24935858160656, 24.99045350523379],
                    [77.25585144098332, 24.835402173710936],
                    [77.26232814607975, 24.680347344995297],
                    [77.26878885107118, 24.525289036489987],
                    [77.27523370891072, 24.370227265672515],
                    [77.28166287134496, 24.215162050094623],
                    [77.28807648892962, 24.060093407382126],
                    [77.29447471104486, 23.905021355234737],
                    [77.30085768591042, 23.74994591142589],
                    [77.30722556060063, 23.594867093802595],
                    [77.31357848105921, 23.439784920285184],
                    [77.31991659211373, 23.284699408867155],
                    [77.32624003749008, 23.129610577614997],
                    [77.33254895982665, 22.974518444667915],
                    [77.33884350068836, 22.819423028237676],
                    [77.34512380058042, 22.664324346608367],
                    [77.35138999896215, 22.509222418136154],
                    [77.35764223426025, 22.354117261249105],
                    [77.36388064388234, 22.199008894446862],
                    [77.3701053642299, 22.043897336300503],
                    [77.3763165307114, 21.888782605452207],
                    [77.38251427775506, 21.733664720615067],
                    [77.38869873882152, 21.57854370057277],
                    [77.39487004641632, 21.423419564179376],
                    [77.40102833210226, 21.26829233035903],
                    [77.40717372651162, 21.113162018105694],
                    [77.41330635935817, 20.958028646482845],
                    [77.41942635944909, 20.80289223462321],
                    [77.42553385469672, 20.647752801728476],
                    [77.43162897213014, 20.49261036706898],
                    [77.43771183790669, 20.337464949983403],
                    [77.44378257732329, 20.182316569878477],
                    [77.44984131482761, 20.027165246228673],
                    [77.45588817402916, 19.872010998575863],
                    [77.46192327771023, 19.71685384652902],
                    [77.46794674783668, 19.56169380976389],
                    [77.4739587055686, 19.406530908022635],
                    [77.47995927127093, 19.25136516111355],
                    [77.48594856452382, 19.096196588910637],
                    [77.49192670413296, 18.94102521135335],
                    [77.49789380813982, 18.785851048446183],
                    [77.50384999383165, 18.63067412025834],
                    [77.50979537775147, 18.475494446923374],
                    [77.51573007570798, 18.320312048638826],
                    [77.52165420278517, 18.16512694566583],
                    [77.52756787335207, 18.009939158328773],
                    [77.5334712010722, 17.854748707014917],
                    [77.53936429891303, 17.699555612173974],
                    [77.54524727915522, 17.544359894317797],
                    [77.55112025340189, 17.3891615740199],
                    [77.55698333258775, 17.23396067191515],
                    [77.562836626988, 17.078757208699308],
                    [77.56868024622739, 16.923551205128653],
                    [77.5745142992889, 16.768342682019565],
                    [77.58033889452253, 16.613131660248136],
                    [77.58615413965394, 16.457918160749728],
                    [77.59196014179297, 16.302702204518578],
                    [77.59775700744208, 16.14748381260737],
                    [77.60354484250472, 15.99226300612679],
                    [77.60932375229358, 15.837039806245146],
                    [77.61509384153887, 15.681814234187875],
                    [77.62085521439627, 15.52658631123716],
                    [77.62660797445514, 15.37135605873144],
                    [77.63235222474631, 15.216123498065015],
                    [77.63808806775, 15.060888650687568],
                    [77.64381560540365, 14.90565153810373],
                    [77.64953493910951, 14.750412181872605],
                    [77.65524616974243, 14.595170603607356],
                    [77.66094939765728, 14.439926824974679],
                    [77.6666447226965, 14.284680867694409],
                    [77.67233224419753, 14.129432753539005],
                    [77.67801206100012, 13.974182504333093],
                    [77.68368427145356, 13.818930141953013],
                    [77.689348973424, 13.663675688326293],
                    [77.69500626430151, 13.508419165431231],
                    [77.70065624100715, 13.353160595296366],
                    [77.706299, 13.1979],
                ],
            },
            airports: [
                {
                    icao: "VIDP",
                    status: "VFR",
                    coord: [77.09519, 28.55563],
                },
                {
                    icao: "VOBL",
                    status: "VFR",
                    coord: [77.706299, 13.1979],
                },
            ],
            hazards: [],
        },
    },
    error: null,
};

export default function PlanDetailPage() {
    const { id } = useParams();
    const [briefingData, setBriefingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('briefing');

    useEffect(() => {
        if (!id) return;

        // Try to get the briefing data from sessionStorage first
        const storedData = sessionStorage.getItem(`briefing_${id}`);
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                setBriefingData(parsed);
                setLoading(false);
                return;
            } catch (e) {
                console.error('Error parsing stored briefing data:', e);
            }
        }

        // If no stored data, show message that user should generate a new briefing
        setError('No briefing data found. Please generate a new weather briefing from the homepage.');
        setLoading(false);
    }, [id]);

    const handleFeedbackSubmit = (feedback: any) => {
        console.log('Feedback submitted:', feedback);
        // In production, send to API
        // You could also update local state to show submission success
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Weather Briefing Not Found</h1>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <a href="/" className="text-blue-600 hover:underline">
                            Return to Homepage
                        </a>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Extract airports from briefing data - check multiple possible sources
    const departure = briefingData?.route_info?.departure || 
                     briefingData?.origin || 
                     briefingData?.briefing?.route?.split(' → ')[0] || 
                     briefingData?.briefing?.route?.split('→')[0]?.trim() ||
                     'DEP';
    const arrival = briefingData?.route_info?.arrival || 
                   briefingData?.destination || 
                   briefingData?.briefing?.route?.split(' → ')[1] || 
                   briefingData?.briefing?.route?.split('→')[1]?.trim() ||
                   'ARR';

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-6">
                {/* Enhanced Flight Summary Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Route className="h-8 w-8 text-blue-600" />
                            Flight Plan Details
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                    
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Route</p>
                                    <p className="text-lg font-semibold">{departure} → {arrival}</p>
                                </div>
                                <Navigation className="h-8 w-8 text-blue-600" />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Distance</p>
                                    <p className="text-lg font-semibold">
                                        {briefingData?.route_info?.distance_nm || 
                                         briefingData?.briefing?.distance?.replace(' NM', '') || 
                                         briefingData?.route_metrics?.actual_distance ||
                                         'N/A'} NM
                                    </p>
                                </div>
                                <Route className="h-8 w-8 text-green-600" />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Flight Time</p>
                                    <p className="text-lg font-semibold">
                                        {briefingData?.route_info?.flight_time || 
                                         briefingData?.briefing?.estimated_time || 
                                         briefingData?.route_metrics?.calculated_time ||
                                         'N/A'}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-orange-600" />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Weather</p>
                                    <Badge variant={briefingData?.flight_decision?.risk_score <= 30 ? 'default' : 
                                                   briefingData?.flight_decision?.risk_score <= 50 ? 'secondary' : 'destructive'}>
                                        {briefingData?.flight_decision?.decision || 'N/A'}
                                    </Badge>
                                </div>
                                <CloudRain className="h-8 w-8 text-purple-600" />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Enhanced Tabbed Interface */}
                <Tabs defaultValue="briefing" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="briefing" className="flex items-center gap-2">
                            <CloudRain className="h-4 w-4" />
                            Briefing
                        </TabsTrigger>
                        <TabsTrigger value="map" className="flex items-center gap-2">
                            <Navigation className="h-4 w-4" />
                            Flight Map
                        </TabsTrigger>
                        <TabsTrigger value="graphics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Weather Graphics
                        </TabsTrigger>
                        <TabsTrigger value="next-steps" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Next Steps
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Reviews
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="briefing" className="mt-6">
                        <WeatherBriefingDisplay data={briefingData} />
                    </TabsContent>
                    
                    <TabsContent value="map" className="mt-6">
                        <RouteVisualizationPage
                            departure={departure}
                            arrival={arrival}
                            waypoints={briefingData?.route_info?.waypoints || []}
                            weatherData={briefingData}
                        />
                    </TabsContent>
                    
                    <TabsContent value="graphics" className="mt-6">
                        <WeatherGraphicsDisplay 
                            weatherData={briefingData} 
                            routeInfo={briefingData?.route_info}
                        />
                    </TabsContent>
                    
                    <TabsContent value="next-steps" className="mt-6">
                        <NextStepsDisplay 
                            mlModelOutput={briefingData?.ml_insights}
                            weatherData={briefingData}
                            routeInfo={briefingData?.route_info}
                        />
                    </TabsContent>
                    
                    <TabsContent value="feedback" className="mt-6">
                        <UserFeedbackSystem 
                            flightRoute={`${departure} → ${arrival}`}
                            onFeedbackSubmit={handleFeedbackSubmit}
                        />
                    </TabsContent>
                    
                    <TabsContent value="settings" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Flight Performance Analytics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Performance Metrics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Fuel Efficiency</span>
                                            <Badge variant="outline">Optimal</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Route Efficiency</span>
                                            <Badge variant="outline">95%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Weather Impact</span>
                                            <Badge variant="outline">Low</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>On-Time Probability</span>
                                            <Badge variant="outline">92%</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Risk Assessment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Risk Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Overall Risk</span>
                                            <Badge variant={briefingData?.risk_assessment?.overall_risk <= 30 ? 'default' : 
                                                           briefingData?.risk_assessment?.overall_risk <= 50 ? 'secondary' : 'destructive'}>
                                                {briefingData?.risk_assessment?.overall_risk || 0}%
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Departure Risk</span>
                                            <Badge variant="outline">{briefingData?.risk_assessment?.departure_risk || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Arrival Risk</span>
                                            <Badge variant="outline">{briefingData?.risk_assessment?.arrival_risk || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Weather Confidence</span>
                                            <Badge variant="outline">{briefingData?.ml_insights?.model_confidence || 'High'}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Aircraft Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Aircraft Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Aircraft Type</label>
                                            <p className="text-sm text-muted-foreground">Boeing 737-800</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Cruise Speed</label>
                                            <p className="text-sm text-muted-foreground">450 knots</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Service Ceiling</label>
                                            <p className="text-sm text-muted-foreground">FL410</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Fuel Capacity</label>
                                            <p className="text-sm text-muted-foreground">26,020 lbs</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Flight Parameters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Fuel className="h-5 w-5" />
                                        Flight Parameters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Planned Altitude</label>
                                            <p className="text-sm text-muted-foreground">FL350</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Alternate Airport</label>
                                            <p className="text-sm text-muted-foreground">KORD</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Minimum Fuel</label>
                                            <p className="text-sm text-muted-foreground">8,500 lbs</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Passenger Count</label>
                                            <p className="text-sm text-muted-foreground">148</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </div>
    );
}


