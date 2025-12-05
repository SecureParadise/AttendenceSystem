// components/dashboard/DashboardHeader.tsx

import ImageContainer from "./ImageContainer";
import { GraduationCap } from "lucide-react";

interface customImageProps {
  src: string;
  alt: string;
  tailcs?: string;
  stylus?: React.CSSProperties;
}
const CustomImage = ({ src, alt, tailcs, stylus }: customImageProps) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      <ImageContainer src={src} alt={alt} tailcs={tailcs} stylus={stylus} />
    </div> 
  );
};

const DashboardHeader = () => {
  const defaultImageStyle = {
    objectFit: "contain" as const,
    width: "100%",
    height: "100%",
  };
  return (
    <header className="w-full bg-linear-to-br from-blue-800 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
      {/* Enhanced background with subtle shine effect */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-4 sm:gap-6 relative z-10">

        {/* DESKTOP: WRC Logo on LEFT */}
        <div className="shrink-0 hover:scale-105 transition-transform duration-300 hidden sm:block">
          <CustomImage
            src="/wrc-logo.png"
            alt="WRC Institution Logo"
            tailcs="object-contain w-full h-full p-1.5 sm:p-2"
            stylus={defaultImageStyle}
          />
        </div>

        {/* CENTER: Main content with improved spacing */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Name + ID section */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                  Mukesh Amaresh Thakur
                </h1>
                <div className="text-xs sm:text-sm text-blue-200 font-medium">
                  Bachelor of Engineering
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center px-3 py-1.5 bg-linear-to-r from-blue-700/90 to-blue-800/90 rounded-full text-xs sm:text-sm font-semibold border border-blue-500/30 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <span className="font-mono tracking-tight">PAS078BEI023</span>
                </div>
              </div>
            </div>

            {/* Divider - enhanced */}
            <div className="hidden sm:flex h-10 w-px bg-linear-to-b from-transparent via-white/20 to-transparent mx-2"></div>

            {/* Academic info section - refined */}
            <div className="flex items-center">
              <div className="flex items-center gap-4 p-3 bg-linear-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/15 shadow-inner hover:from-white/8 hover:to-white/12 transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500/30 to-purple-500/30">
                  <GraduationCap size={20} className="text-indigo-200" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="text-base sm:text-lg font-bold text-white">
                    5th Semester
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200/90 font-medium max-w-[200px] sm:max-w-xs truncate">
                    Electronics Communication &amp; Information
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE: Hidden, DESKTOP: User Image on RIGHT */}
        <div className="shrink-0 hover:scale-105 transition-transform duration-300">
          <CustomImage src="/mukesh.jpg" alt="WRC Institution Logo" />
        </div>
        
      </div>
    </header>
  );
};

export default DashboardHeader;
