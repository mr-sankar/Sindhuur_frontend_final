
import { Shield, Users, Heart, Award, Clock, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "100% Verified Profiles",
      description: "All profiles are manually verified with document authentication",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Users,
      title: "5 Lakh+ Members",
      description: "Largest database of verified matrimony profiles",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Heart,
      title: "50,000+ Success Stories",
      description: "Thousands of happy couples found their match",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Award,
      title: "15+ Years Experience",
      description: "Trusted matrimony service with proven track record",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: Clock,
      title: "24/7 Customer Support",
      description: "Round-the-clock assistance for all your queries",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Phone,
      title: "Personal Relationship Manager",
      description: "Dedicated support to help you find your perfect match",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose Sindhuura?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            India's most trusted matrimony service with the highest success rate
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-yellow-100">
              <CardContent className="p-6">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
