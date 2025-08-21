import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Calendar, MapPin, Quote, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";  

const SuccessStories = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    names: "",
    weddingDate: "",
    location: "",
    email: "",
    story: "",
    imageUrl: "",
    imageFile: null as File | null,
  });
  const [submittedStories, setSubmittedStories] = useState<
    {
      _id: string;
      names: string;
      weddingDate: string;
      location: string;
      story: string;
      image: string;
      createdAt: string;
    }[]
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageOption, setImageOption] = useState<"url" | "file">("url");
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData | "image", string>>
  >({});
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch stories on component mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/stories`);
        setSubmittedStories((prev) => {
        const newStories = response.data.filter(
          (newStory) => !prev.some((story) => story._id === newStory._id)
        );
        return [...prev, ...newStories];
      });
      } catch (error) {
        console.error("Error fetching stories:", error);
        alert("Failed to fetch stories. Please try again later.");
      }
    };
    fetchStories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file, imageUrl: "" }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(null);
    }
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, imageUrl: value, imageFile: null }));
    setImagePreview(value || null);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData | "image", string>> =
      {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const today = new Date();
    const inputDate = formData.weddingDate
      ? new Date(formData.weddingDate)
      : null;

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Wedding date validation
    if (!formData.weddingDate) {
      newErrors.weddingDate = "Wedding date is required";
    } else if (inputDate && inputDate > today) {
      newErrors.weddingDate = "Wedding date must be in the past";
    }

    // Image validation
    if (!formData.imageUrl && !formData.imageFile) {
      newErrors.image = "Please provide an image URL or upload an image";
    }

    // Names validation
    if (!formData.names.trim()) {
      newErrors.names = "Names are required";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Story validation
    if (!formData.story.trim()) {
      newErrors.story = "Your love story is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("names", formData.names);
      data.append("weddingDate", formData.weddingDate);
      data.append("location", formData.location);
      data.append("email", formData.email);
      data.append("story", formData.story);
      if (formData.imageFile) {
        data.append("stories", formData.imageFile);
      } else {
        data.append("imageUrl", formData.imageUrl);
      }

      const response = await axios.post(`${API_BASE_URL}/api/stories`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update submittedStories with the new story
      setSubmittedStories((prev) => [
        {
          _id: response.data._id,
          names: formData.names,
          weddingDate: formData.weddingDate,
          location: formData.location,
          story: formData.story,
          image: formData.imageFile
            ? URL.createObjectURL(formData.imageFile)
            : formData.imageUrl || response.data.image,
          createdAt: response.data.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);

      // Reset form
      setFormData({
        names: "",
        weddingDate: "",
        location: "",
        email: "",
        story: "",
        imageUrl: "",
        imageFile: null,
      });
      setImagePreview(null);
      setImageOption("url");
      setErrors({});
      alert("Thank you for sharing your story!");
    } catch (error: any) {
      console.error("Error submitting story:", error);
      alert(
        error.response?.data?.error ||
          "Failed to submit story. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://via.placeholder.com/150";
  };

  const openModal = (story: any, imageIndex: number = 0) => {
    setSelectedStory(story);
    setCurrentImageIndex(imageIndex);
  };

  const closeModal = () => {
    setSelectedStory(null);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? submittedStories.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === submittedStories.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <Heart className="mx-auto mb-6 h-16 w-16 text-pink-200 animate-pulse" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
            Love Stories That Inspire
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-pink-100 max-w-3xl mx-auto leading-relaxed">
            Discover beautiful journeys of couples who found their soulmates
            through KannadaMatch. Their stories prove that true love knows no
            boundaries.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Share Your Story Section */}
        <div className="relative px-2 sm:px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-red-500/10 rounded-3xl"></div>
          <Card className="relative max-w-4xl mx-auto border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-6">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white fill-current" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
                  Share Your Love Story
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                  Found your perfect match through KannadaMatch? We'd love to
                  celebrate your journey and inspire others looking for love!
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Your Names *
                    </label>
                    <Input
                      name="names"
                      value={formData.names}
                      onChange={handleInputChange}
                      placeholder="e.g., Priya & Suresh"
                      className={`h-10 sm:h-12 border-2 ${
                        errors.names ? "border-red-400" : "border-pink-100"
                      } focus:border-pink-400 bg-white/50 text-xs sm:text-sm`}
                      required
                    />
                    {errors.names && (
                      <p className="text-red-500 text-xs">{errors.names}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Wedding Date *
                    </label>
                    <Input
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleInputChange}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      className={`h-10 sm:h-12 border-2 ${
                        errors.weddingDate
                          ? "border-red-400"
                          : "border-pink-100"
                      } focus:border-pink-400 bg-white/50 text-xs sm:text-sm`}
                      required
                    />
                    {errors.weddingDate && (
                      <p className="text-red-500 text-xs">
                        {errors.weddingDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Wedding Location *
                    </label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Bangalore"
                      className={`h-10 sm:h-12 border-2 ${
                        errors.location ? "border-red-400" : "border-pink-100"
                      } focus:border-pink-400 bg-white/50 text-xs sm:text-sm`}
                      required
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs">{errors.location}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Your Email *
                    </label>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="your.email@example.com"
                      className={`h-10 sm:h-12 border-2 ${
                        errors.email ? "border-red-400" : "border-pink-100"
                      } focus:border-pink-400 bg-white/50 text-xs sm:text-sm`}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Add Your Image *
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    Please provide either an image URL or upload an image file
                    (jpg, png, gif, max 5MB).
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="imageOption"
                        value="url"
                        checked={imageOption === "url"}
                        onChange={() => {
                          setImageOption("url");
                          setFormData((prev) => ({
                            ...prev,
                            imageFile: null,
                          }));
                          setImagePreview(formData.imageUrl || null);
                        }}
                        className="h-4 w-4 text-pink-500 focus:ring-pink-400"
                      />
                      <label className="text-xs sm:text-sm text-gray-700">
                        Image URL
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="imageOption"
                        value="file"
                        checked={imageOption === "file"}
                        onChange={() => {
                          setImageOption("file");
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                          setImagePreview(
                            formData.imageFile ? imagePreview : null
                          );
                        }}
                        className="h-4 w-4 text-pink-500 focus:ring-pink-400"
                      />
                      <label className="text-xs sm:text-sm text-gray-700">
                        Upload Image
                      </label>
                    </div>
                  </div>
                  <div className="mt-2">
                    {imageOption === "url" ? (
                      <Input
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="e.g., https://example.com/image.jpg"
                        className={`h-10 sm:h-12 border-2 ${
                          errors.image ? "border-red-400" : "border-pink-100"
                        } focus:border-pink-400 bg-white/50 text-xs sm:text-sm`}
                      />
                    ) : (
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleFileChange}
                        className={`h-10 sm:h-12 border-2 ${
                          errors.image ? "border-red-400" : "border-pink-100"
                        } focus:border-pink-400 bg-white/50 text-xs sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100`}
                      />
                    )}
                    {errors.image && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.image}
                      </p>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-xs rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                    Your Love Story *
                  </label>
                  <Textarea
                    name="story"
                    value={formData.story}
                    onChange={handleInputChange}
                    placeholder="Tell us how you met through Sindhuura, your journey to marriage, and what made your connection special..."
                    rows={5}
                    className={`border-2 ${
                      errors.story ? "border-red-400" : "border-pink-100"
                    } focus:border-pink-400 bg-white/50 resize-none text-xs sm:text-sm`}
                    required
                  />
                  {errors.story && (
                    <p className="text-red-500 text-xs">{errors.story}</p>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-12 text-sm sm:text-lg font-semibold bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    )}
                    {loading ? "Sharing..." : "Share Your Beautiful Story"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Stories Carousel */}
        <div className="mt-8">
          <style>
            {`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}
          </style>
          <h2 className="text-2xl font-semibold text-gray-800 pt-3 mb-6 text-center">
            Success Stories
          </h2>
          {submittedStories.length === 0 ? (
            <p className="text-gray-600 text-center">No success stories found.</p>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto space-x-4 md:space-x-6 px-2 md:px-4 py-4 snap-x snap-mandatory no-scrollbar"
              style={{ scrollBehavior: "smooth" }}
            >
              {submittedStories.map((story, index) => (
                <Card
                  key={`${story._id}-${index}`}
                  className="flex-shrink-0 w-64 sm:w-72 md:w-80 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 snap-center"
                  onClick={() => openModal(story, index)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                    <img
                      src={
                        story.image.startsWith("http")
                          ? story.image
                          : `${API_BASE_URL}${story.image}`
                      }
                      alt={story.names}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">
                      {story.names}
                    </h3>
                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                      <div className="flex items-center gap-1 md:gap-2">
                        <MapPin size={12} className="text-yellow-600" />
                        <span>{story.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2">
                        <Heart size={12} className="text-yellow-600" />
                        <span>
                          {new Date(story.weddingDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-3 italic">
                      "{story.story}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Story Details with Image Carousel */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
              <img
                src={
                  submittedStories[currentImageIndex].image.startsWith("http")
                    ? submittedStories[currentImageIndex].image
                    : `${API_BASE_URL}${submittedStories[currentImageIndex].image}`
                }
                alt={submittedStories[currentImageIndex].names}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200 z-10"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <div className="absolute top-2 left-2 right-2 flex justify-between">
                <button
                  onClick={handlePrevImage}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {submittedStories.map((_, index) => (
                  <span
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                {submittedStories[currentImageIndex].names}
              </h3>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  {new Date(submittedStories[currentImageIndex].weddingDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  {submittedStories[currentImageIndex].location}
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 h-5 sm:h-6 w-5 sm:w-6 text-pink-200" />
                <p className="text-gray-600 leading-relaxed pl-5 sm:pl-6 italic text-xs sm:text-base">
                  {submittedStories[currentImageIndex].story}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuccessStories;