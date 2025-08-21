import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Shield, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import Gangadhar from "@/assets/GANGADHAR_vp.jpeg";
import Veeresh from "@/assets/Veeresh_MD.jpeg";
import kiran from "@/assets/kiran kumar km.jpeg";
import Nethra from '@/assets/Nethra soranagi.jpeg';
import Ashwini from '@/assets/Ashwini Chandra.jpeg';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">About Sindhuura</h1>
            <p className="text-lg text-gray-600">
              India's most trusted matrimonial platform for finding your perfect life partner
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h3>
                <p className="text-gray-600">
                  To help individuals find their perfect life partner while preserving 
                  cultural values and traditions. We believe every person deserves to find love and 
                  companionship in a safe, respectful environment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Community</h3>
                <p className="text-gray-600">
                  With over 10 lakh verified profiles from across India and worldwide, 
                  we've helped thousands of couples find their soulmates. Our community spans 
                  all professions, backgrounds, and locations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Privacy & Safety</h3>
                <p className="text-gray-600">
                  Your privacy is our priority. We use advanced security measures to protect 
                  your personal information and ensure all profiles are manually verified 
                  before being published.
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Success Stories</h3>
                <p className="text-gray-600">
                  Over 50,000 happy couples have found their life partners through Sindhuura. 
                  Their success stories inspire us to continue connecting hearts and building 
                  beautiful relationships.
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Leadership Team Section */}
<div className="mb-16">
  <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Meet Our Leadership Team</h2>
  <div className="grid md:grid-cols-2 gap-8">

    {/* Nethra Soranagi */}
    <Card className="border-yellow-200">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <img src={Nethra} alt="Nethra Soranagi" className="w-48 h-48 rounded-full object-cover mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Nethra Soranagi</h3>
        <p className="text-yellow-600 font-medium mb-2">Founder & CEO</p>
        <p className="text-gray-600">
          Founder of Public Dream Group and Charitable Trust, Nethra brings over 9 years of leadership and vision to Sindhuura.
          Passionate about empowering individuals through meaningful connections, she has led Sindhuura to become one of India’s most trusted matrimonial platforms.
        </p>
      </CardContent>
    </Card>

    {/* KV Gangadhar */}
    <Card className="border-yellow-200">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <img src={Gangadhar} alt="KV Gangadhar" className="w-48 h-48 rounded-full object-cover mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">KV Gangadhar</h3>
        <p className="text-yellow-600 font-medium mb-2">Vice President</p>
        <p className="text-gray-600">
          As Vice President, Gangadhar plays a crucial role in overseeing operational excellence and user satisfaction. 
          His dedication ensures our platform remains a secure and culturally inclusive space for life partner search.
        </p>
      </CardContent>
    </Card>

    {/* KB Veeresha */}
    <Card className="border-yellow-200">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <img src={Veeresh} alt="KB Veeresh" className="w-48 h-48 rounded-full object-cover mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">KB Veeresh</h3>
        <p className="text-yellow-600 font-medium mb-2">Managing Director</p>
        <p className="text-gray-600">
          KB Veeresh ensures that Sindhuura continues to grow with strong leadership, strategic planning, and innovation.
          His work drives the development of user-friendly features and real-time matchmaking technologies.
        </p>
      </CardContent>
    </Card>

    {/* Kiran Kumar KM */}
    <Card className="border-yellow-200">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <img src={kiran} alt="Kiran Kumar KM" className="w-48 h-48 rounded-full object-cover mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Kiran Kumar KM</h3>
        <p className="text-yellow-600 font-medium mb-2">Chief Operating Director</p>
        <p className="text-gray-600">
          With deep operational expertise, Kiran Kumar ensures smooth day-to-day functioning of the platform while maintaining quality and performance standards across departments.
        </p>
      </CardContent>
    </Card>

    {/* Ashwini Chandra */}
    <Card className="border-yellow-200">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <img src={Ashwini} alt="Ashwini Chandra" className="w-48 h-48 rounded-full object-cover mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Ashwini Chandra</h3>
        <p className="text-yellow-600 font-medium mb-2">Chief Media Coordinator</p>
        <p className="text-gray-600">
          Ashwini oversees all media and communications at Sindhuura. With a sharp eye for branding and outreach, she ensures our message connects with the right audience across all platforms.
        </p>
      </CardContent>
    </Card>

  </div>
</div>


{/* About the Platform */}
<div className="max-w-3xl mx-auto text-center mb-20">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">About Our Matrimony Platform</h2>
  <p className="text-gray-600 text-lg">
    Sindhuura is a culturally rooted, secure, and modern matrimonial platform designed to bring together individuals seeking meaningful life partnerships.
    With a growing base of verified users, advanced matchmaking technology, manual profile screening, and personalized assistance, Sindhuura continues to build lasting relationships across communities.
    Whether you're from a rural or urban background, our mission is to guide you toward a happy married life.
  </p>
</div>


          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Find Your Perfect Match?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of singles who have found love through our platform
            </p>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 px-8 py-3 text-lg">
                Join Free Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;