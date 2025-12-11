// components/dashboard/ImageContainer.tsx
import Image from "next/image";

interface ImageContainerProps {
  src: string;
  alt: string; 
  tailcs?: string;
  stylus?:React.CSSProperties;
}

const ImageContainer = ({ src, alt = "",tailcs,stylus }: ImageContainerProps) => {
  return (
    <div className="relative w-25 h-25 sm:w-24 sm:h-24">
      {/* Main container - Simple and clean */}
      <div className="relative w-full h-full rounded-full border-3 border-white/40 bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 shadow-lg">
        <div className="w-full h-full rounded-full overflow-hidden border border-white/30 bg-white">
          <Image
            src={src}
            alt={alt}
            width={120}
            height={120}
            className={tailcs}
            style={stylus}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageContainer;