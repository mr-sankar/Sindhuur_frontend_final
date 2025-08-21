import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, User, ArrowDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Support = () => {
  // Assuming profileId is stored in localStorage after login
  const profileId = localStorage.getItem('profileId') || ''; // Replace with your auth mechanism
  const [formData, setFormData] = useState({
    profileId: profileId,
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const [supportRequests, setSupportRequests] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const faqs = [
    // ... (unchanged FAQ data)
  ];

  // Fetch support requests on component mount
  useEffect(() => {
    if (profileId || formData.name) {
      fetchSupportRequests();
    }
  }, [profileId, formData.name]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profileId || !formData.name || !formData.email || !formData.subject || !formData.category || !formData.message) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/submit-support-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setError(null);
        setFormData({ profileId, name: "", email: "", subject: "", category: "", message: "" });
        fetchSupportRequests(); // Refresh support requests
      } else {
        setError(data.error);
        setSuccess(null);
      }
    } catch (err) {
      setError("Failed to submit request");
      setSuccess(null);
    }
  };

  const fetchSupportRequests = async () => {
    try {
      const query = profileId ? `profileId=${profileId}` : `name=${encodeURIComponent(formData.name)}`;
      const response = await fetch(`${BASE_URL}/api/support-requests?${query}`);
      const data = await response.json();
      if (response.ok) {
        setSupportRequests(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch support requests");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help you find your perfect match. Get answers to common questions or reach out to our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <Mail size={24} className="text-orange-500" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="payment">Payment & Billing</SelectItem>
                        <SelectItem value="profile">Profile Related</SelectItem>
                        <SelectItem value="matching">Matching Issues</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="report">Report a Member</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your query"
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    Send Message
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-orange-100">
                  <p className="text-sm text-gray-600 mb-2"></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ and Support Requests Section */}
          <div>
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <User size={24} className="text-orange-500" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-orange-100 rounded-lg px-4">
                      <AccordionTrigger className="text-left hover:text-orange-600">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Support Requests Display */}
            <Card className="mt-6 border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Your Support Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supportRequests.length === 0 ? (
                  <p className="text-gray-600">No support requests found.</p>
                ) : (
                  <div className="space-y-4">
                    {supportRequests.map((request, index) => (
                      <div key={index} className="border border-orange-100 p-4 rounded-lg">
                        <p><strong>Subject:</strong> {request.subject}</p>
                        <p><strong>Category:</strong> {request.category}</p>
                        <p><strong>Message:</strong> {request.message}</p>
                        <p><strong>Status:</strong> {request.status}</p>
                        <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="mt-6 border-orange-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-600 ml-2">support@publicmatrimony.com</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="text-gray-600 ml-2">+91 80-4567-8900</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Support Hours:</span>
                    <span className="text-gray-600 ml-2">Monday - Friday: 9:00 AM - 6:00 PM</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Office Address:</span>
                    <span className="text-gray-600 ml-2">KannadaMatch Pvt Ltd, Brigade Road, Bangalore - 560001</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Support;