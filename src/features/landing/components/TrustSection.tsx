import { CheckCircle, Shield, Star, FileText, Lock, Zap, Users, Award } from 'lucide-react';

export function TrustSection() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Tasdiqlangan akkauntlar',
      description: 'Barcha foydalanuvchilar va kompaniyalar qo\'shimcha tekshiruvdan o\'tadi',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Shield,
      title: "Soxta ishlar yo'q",
      description: 'Har bir vakansiya avtomatik tekshiriladi. Faqat haqiqiy va tasdiqlangan ishlar',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Star,
      title: 'Reyting va sharhlar',
      description: 'Har bir ish beruvchi va xodim baholanadi. Shaffof va adolatli tizim',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: FileText,
      title: 'Haqiqiy profillar',
      description: 'To\'liq ma\'lumotlar, tajriba va portfolio. Hech qanday yolg\'on ma\'lumotlar',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Lock,
      title: 'Xavfsizlik',
      description: 'Barcha ma\'lumotlar shifrlangan. Maxfiylik kafolatlangan',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Zap,
      title: 'Tezkor javob',
      description: 'O\'rtacha 2 soat ichida javob oling. Tezkor aloqa va suhbatlar',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-700 font-medium mb-4">
            <Shield className="h-3 w-3" />
            <span>Ishonchli platforma</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Nega ISH ishonchli?
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Biz O'zbekistondagi eng xavfsiz va ishonchli ish topish platformasini yaratdik.
            <span className="block mt-1 text-sm text-gray-500">
              Har bir qadamda sizning xavfsizligingiz va muvaffaqiyatingiz bizning ustuvor vazifamiz.
            </span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-[#0A66C2] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${feature.bgColor} group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional trust badge */}
        {/* <div className="mt-10 flex flex-wrap items-center justify-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            <div className="text-left">
              <div className="font-bold text-gray-900 text-sm">ISO 27001</div>
              <div className="text-xs text-gray-600">Xavfsizlik sertifikati</div>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            <div className="text-left">
              <div className="font-bold text-gray-900 text-sm">120,000+</div>
              <div className="text-xs text-gray-600">Ishonchli foydalanuvchilar</div>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-500" />
            <div className="text-left">
              <div className="font-bold text-gray-900 text-sm">100%</div>
              <div className="text-xs text-gray-600">Tasdiqlangan vakansiyalar</div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
