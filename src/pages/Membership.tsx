import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Crown, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Membership = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = (planName: string, price: string) => {
    if (price === "₹0") {
      navigate("/signup");
    } else {
      navigate(
        `/payment?plan=${planName.toLowerCase()}&price=${price
          .replace("₹", "")
          .replace(",", "")}`
      );
    }

    toast({
      title: "Plan Selected",
      description: `You've selected the ${planName} plan. Redirecting to ${
        price === "₹0" ? "registration" : "payment"
      }...`,
    });
  };

  const plans = [
    {
      name: "Free",
      price: "₹0",
      duration: "Forever",
      icon: Star,
      popular: false,
      features: [
        "Create profile",
        "View 5 profiles per day",
        "Send 2 interests per day",
        "Basic search filters",
      ],
      limitations: [
        "Cannot view contact details",
        "Limited profile views",
        "No profile boost",
      ],
    },
    {
      name: "Premium",
      price: "₹2,999",
      duration: "3 Months",
      icon: Crown,
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited profile views",
        "View contact details",
        "Advanced search filters",
        "Send unlimited interests",
        "Profile boost (2x visibility)",
        "Priority customer support",
      ],
      limitations: [],
    },
    {
      name: "Premium Plus",
      price: "₹4,999",
      duration: "6 Months",
      icon: Zap,
      popular: false,
      features: [
        "Everything in Premium",
        "Horoscope matching",
        "Profile verification badge",
        "Top profile placement",
        "Exclusive member events",
      ],
      limitations: [],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Membership Plans
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to find your perfect match. All plans
            include our trust and safety features.
          </p>
        </div>

        <div className="flex justify-center items-center gap-8 mb-12 flex-wrap">
          <div className="flex items-center gap-2 text-green-600">
            <Check size={20} />
            <span className="font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Check size={20} />
            <span className="font-medium">100% Verified Profiles</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Check size={20} />
            <span className="font-medium">24/7 Support</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-orange-300 shadow-lg scale-105"
                  : "border-orange-100"
              }`}
            >
          {plan.popular && (
  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-medium">
    Most Popular
  </div>
)}

           <CardHeader className="text-center pb-4">
  <div
    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
      plan.popular
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white mt-6"
        : "bg-orange-100 text-orange-600"
    }`}
  >
    <plan.icon size={24} />
  </div>

                <CardTitle className="text-2xl text-gray-800">
                  {plan.name}
                </CardTitle>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-800">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/ {plan.duration}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Features Included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check
                          size={16}
                          className="text-green-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Limitations:
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-red-300 rounded-full mt-0.5 flex-shrink-0"></div>
                          <span className="text-sm text-gray-500">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => handlePlanSelection(plan.name, plan.price)}
                  disabled={plan.price === "₹0"}
                  className={`w-full text-white ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                >
                  {plan.price === "₹0"
                    ? "Free"
                    : "Choose This Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "How secure are the payments?",
                answer:
                  "We use industry-standard SSL encryption and work with trusted payment gateways to ensure your financial information is completely secure.",
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer:
                  "Yes, you can upgrade your plan at any time. For downgrades, the changes will take effect at the end of your current billing cycle.",
              },
              {
                question: "What happens after my membership expires?",
                answer:
                  "Your account will revert to the free plan. Your profile remains active, but premium features will be disabled until renewal.",
              },
              {
                question: "Is there a refund policy?",
                answer:
                  "We offer a 7-day money-back guarantee for premium plans if you're not satisfied with our service.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-orange-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Membership;