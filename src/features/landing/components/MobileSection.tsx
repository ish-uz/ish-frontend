import { Smartphone, Download, QrCode, Bell, MapPin, Clock } from 'lucide-react';

export function MobileSection() {
  const features = [
    { icon: Bell, text: 'Yangi vakansiyalar haqida bildirishnomalar' },
    { icon: MapPin, text: 'Yaqin joydagi ishlarni topish' },
    { icon: Clock, text: '24/7 istalgan vaqtda foydalanish' },
  ];

  return (
    <section className="relative py-12 bg-gradient-to-br from-[#0A66C2] via-blue-600 to-blue-700 text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 border border-white/30 rounded-full text-xs font-medium mb-4">
                <Smartphone className="h-3 w-3" />
                <span>Mobil ilova</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                ISH ilovasi bilan har doim ish yoningizda
              </h2>
              <p className="text-base mb-6 text-blue-100">
                Mobil ilovamizdan foydalanib, istalgan joydan ish toping yoki xodim toping. 
                <span className="block mt-1 text-sm">Tezkor, qulay va xavfsiz.</span>
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-blue-50 text-sm">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Download buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  aria-label="Yuklab olish App Store dan"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  <Download className="h-4 w-4" />
                  <span>App Store</span>
                </a>
                <a
                  href="#"
                  aria-label="Yuklab olish Google Play dan"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  <Download className="h-4 w-4" />
                  <span>Google Play</span>
                </a>
              </div>

              {/* QR Code hint */}
              <div className="mt-6 flex items-center gap-2 text-xs text-blue-200">
                <QrCode className="h-4 w-4" />
                <span>QR kod orqali tezkor yuklab oling</span>
              </div>
            </div>

            {/* Right side - Visual mockup */}
            <div className="relative">
              <div className="relative mx-auto max-w-xs">
                {/* Phone mockup */}
                <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-xl">
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Phone screen content */}
                    <div className="h-[400px] bg-gradient-to-br from-blue-50 to-white p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-24 h-6 bg-gray-200 rounded-full" />
                        <div className="w-12 h-6 bg-gray-200 rounded-full" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-16 bg-blue-100 rounded-lg" />
                        <div className="h-20 bg-gray-100 rounded-lg" />
                        <div className="h-20 bg-gray-100 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-3 -right-3 bg-white text-blue-600 px-3 py-1.5 rounded-lg shadow-lg font-semibold text-xs">
                  Tezkor yuklab olish
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
