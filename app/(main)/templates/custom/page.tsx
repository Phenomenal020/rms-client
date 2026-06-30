import { FileText, Clock, Sparkles } from "lucide-react";

const CustomTemplatesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <FileText className="w-16 h-16 text-white" />
          </div>
          {/* Decorative Sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-gray-400 animate-pulse" />
          <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-gray-400 animate-pulse delay-300" />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Custom Templates
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <p className="text-lg font-medium">Coming Soon</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomTemplatesPage;

