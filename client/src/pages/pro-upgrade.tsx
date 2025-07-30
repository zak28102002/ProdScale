import { motion } from "framer-motion";
import { Link } from "wouter";
import { X, Hash, BarChart3, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProUpgrade() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("annual");

  const handleContinue = () => {
    toast({
      title: "Coming Soon!",
      description: "Pro features will be available in the next update.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-black text-white p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
            <X className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Unlock ProdScale Pro</h1>
        <div className="w-10"></div>
      </div>

      {/* Pricing Options */}
      <div className="space-y-4 mb-8">
        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
          {/* Monthly Plan */}
          <label 
            htmlFor="monthly" 
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPlan === "monthly" 
                ? "border-white bg-gray-900" 
                : "border-gray-700 bg-transparent"
            }`}
          >
            <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "monthly" ? "border-white" : "border-gray-600"
                }`}>
                  {selectedPlan === "monthly" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-lg">Monthly</span>
              </div>
              <span className="text-lg">€1.99</span>
            </div>
          </label>

          {/* Annual Plan */}
          <label 
            htmlFor="annual" 
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
              selectedPlan === "annual" 
                ? "border-purple-500 bg-purple-900/20" 
                : "border-gray-700 bg-transparent"
            }`}
          >
            <RadioGroupItem value="annual" id="annual" className="sr-only" />
            <div className="absolute -top-3 right-4 bg-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold">
              50%
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "annual" ? "border-purple-500" : "border-gray-600"
                }`}>
                  {selectedPlan === "annual" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <div>
                  <span className="text-lg">Annual</span>
                  <div className="text-sm text-gray-400">
                    <span className="line-through">€23.88</span> → €12.99
                  </div>
                </div>
              </div>
              <span className="text-lg">€12.99</span>
            </div>
          </label>

          {/* Lifetime Plan */}
          <label 
            htmlFor="lifetime" 
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPlan === "lifetime" 
                ? "border-white bg-gray-900" 
                : "border-gray-700 bg-transparent"
            }`}
          >
            <RadioGroupItem value="lifetime" id="lifetime" className="sr-only" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "lifetime" ? "border-white" : "border-gray-600"
                }`}>
                  {selectedPlan === "lifetime" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-lg">Lifetime</span>
              </div>
              <span className="text-lg">€34.99</span>
            </div>
          </label>
        </RadioGroup>

        <p className="text-center text-sm text-gray-400 mt-2">
          {selectedPlan === "lifetime" 
            ? "Pay once. Unlimited access forever." 
            : "Recurring billing. Cancel anytime."}
        </p>
        <p className="text-center text-sm text-gray-400">or</p>
      </div>

      {/* Features */}
      <div className="space-y-6 mb-8">
        <p className="text-gray-400 text-sm">By subscribing you'll also unlock:</p>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-400">Unlimited number of activities</h3>
              <p className="text-sm text-gray-400">Unlimited possibilities by creating as many activities as you like</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400">Charts & Statistics</h3>
              <p className="text-sm text-gray-400">See charts and statistics about your consistency</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-400">Home Screen Widgets</h3>
              <p className="text-sm text-gray-400">Show your favorite activities on your home screen</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-300">Dashboard Customization</h3>
              <p className="text-sm text-gray-400">Show streaks and goals, show labels and categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <Button 
        onClick={handleContinue}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl"
      >
        Continue
      </Button>

      {/* Restore Purchase Link */}
      <p className="text-center text-sm text-gray-400 mt-4">
        Already subscribed? <button className="text-purple-400 underline">Restore purchase</button>
      </p>
    </motion.div>
  );
}