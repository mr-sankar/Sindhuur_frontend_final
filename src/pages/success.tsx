import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

function Success() {
  const [stories, setStories] = useState([]);

  // Fetch stories on component mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stories');
        setStories(response.data);
        if (response.data.length === 0) {
          toast.warning('No success stories found.');
        }
      } catch (error) {
        toast.error('Failed to fetch stories: ' + error.message);
      }
    };
    fetchStories();
  }, []);

  // Handle deleting a story
  const handleDeleteStory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/stories/${id}`);
      setStories(stories.filter((story) => story._id !== id));
      toast.success('Story deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete story: ' + (error.response ? error.response.data.error : error.message));
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Success Stories</h1>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {stories.map((story) => (
          <div
            key={story._id}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:scale-105"
          >
            <img
              src={story.image}
              alt={story.names}
              className="w-full h-48 sm:h-56 object-cover"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">{story.names}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(story.weddingDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">{story.location}</p>
              <p className="text-sm text-muted-foreground">{story.email}</p>
              <p className="text-sm text-foreground mt-2 line-clamp-3">{story.story}</p>
              <div className="mt-auto pt-4 flex justify-end space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  style={{ background: "rgba(253, 91, 69, 1)", color: "white" }}
                  onClick={() => handleDeleteStory(story._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Success;