import { Link } from "react-router-dom";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer = () => {
  // Function to scroll to top on link click
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 left-10 text-4xl">💑</div>
        <div className="absolute bottom-10 right-20 text-3xl">💝</div>
        <div className="absolute top-1/2 left-1/4 text-2xl">💖</div>
        <div className="absolute top-20 right-1/3 text-3xl">♥</div>
        <div className="absolute bottom-20 left-1/3 text-2xl">💕</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Heart className="text-white h-6 w-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-yellow-400">
                  Sindhuura
                </span>
                <span className="text-xs text-yellow-300">
                  Find Your Perfect Match
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              India's most trusted matrimonial platform connecting hearts across
              the globe. With over 5 million verified profiles and 50,000+
              success stories, we help you find your perfect life partner with
              complete privacy and security.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span>+91 80-4567-8900</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span>support@sindhuura.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-yellow-400 text-lg">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/search"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Search Profiles
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/success-stories"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  to="https://play.google.com/store/games?device=windows&pli=1"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Mobile App
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Wedding Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-yellow-400 text-lg">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/support"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Report Profile
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-yellow-400 text-lg">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                  onClick={scrollToTop}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & App Downloads */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Social Media */}
            <div className="text-center lg:text-left">
              <h3 className="font-semibold mb-4 text-yellow-400">Follow Us</h3>
              <div className="flex justify-center lg:justify-start space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* App Download */}
            <div className="text-center lg:text-right">
              <h3 className="font-semibold mb-4 text-yellow-400">
                Download Our App
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center"
                >
                  <span className="mr-2">📱</span> Play Store
                </a>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center"
                >
                  <span className="mr-2">🍎</span> App Store
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              &copy; 2025 Sindhuura. All rights reserved. Made with ❤️
              for bringing hearts together.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="bg-green-600 px-2 py-1 rounded text-white">
                SSL Secured
              </span>
              <span className="bg-blue-600 px-2 py-1 rounded text-white">
                ISO Certified
              </span>
              <span className="bg-purple-600 px-2 py-1 rounded text-white">
                Privacy Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
