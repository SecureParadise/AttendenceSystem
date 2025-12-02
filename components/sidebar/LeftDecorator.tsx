import Image from 'next/image'


const LeftDecorator = () => {
  return (
    <>
      <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-linear-to-b from-blue-800 to-indigo-900 text-white lg:col-span-1">
        <div className="w-full space-y-8">
          {/* Logo Container */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
              <div className="relative w-full h-full rounded-full border-4 border-white/30 bg-white/10 backdrop-blur-sm p-3 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/40 bg-white">
                  <Image
                    src="/wrc-logo.png"
                    alt="WRC logo"
                    width={212}
                    height={238} 
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>
            </div>

            {/* University Text */}
            <div className="text-center space-y-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-lg">
                  Tribhuvan University
                </h1>
                <div className="h-1 w-24 bg-linear-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
              </div>

              <h2 className="text-2xl font-semibold text-blue-100">
                Institute of Engineering
              </h2>

              <h3 className="text-2xl font-bold text-white bg-linear-to-r from-transparent via-white/20 to-transparent py-2 px-6 rounded-lg">
                PASHCHIMANCHAL CAMPUS
              </h3>

              <div className="pt-4">
                <p className="text-blue-200 text-sm italic">
                  Western Regional Campus
                </p>
                <p className="text-blue-200/80 text-xs mt-1">लामाचौर , पोखरा</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LeftDecorator