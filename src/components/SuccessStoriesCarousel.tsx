
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SuccessStoriesCarousel = () => {
  const stories = [
    {
      id: 1,
      names: "Priya & Suresh",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3",
      story: "We found each other through Sindhuura and got married in a beautiful traditional ceremony. Thank you for helping us find our perfect match!",
      location: "Bangalore"
    },
    {
      id: 2,
      names: "Kavya & Ramesh",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3",
      story: "After meeting through this platform, we realized we were perfect for each other. Our families are so happy with our match!",
      location: "Mumbai"
    },
    {
      id: 3,
      names: "Lakshmi & Naveen",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3",
      story: "Sindhuura helped us find our soulmates. We're grateful for this wonderful platform that brought us together.",
      location: "Delhi"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real couples who found their perfect match through Sindhuura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow border-yellow-200">
              <div className="aspect-video bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center">
                <img 
                  src={story.image} 
                  alt={story.names}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {story.names}
                </h3>
                <p className="text-sm text-yellow-600 mb-3">{story.location}</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  "{story.story}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/success-stories">
            <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white">
              View All Success Stories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesCarousel;
