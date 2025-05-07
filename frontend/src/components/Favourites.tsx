import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { DialogTrigger, Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { FaHeart } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL;

// A favourites page that shows the users saved Openverse images
export default function FavouritesPage() {
  const [favourites, setFavourites] = useState([]);
  const [favouriteImages, setFavouriteImages] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      const res = await fetch(`${API_BASE}/api/favourites`, {
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Failed to fetch favourites');
        return;
      }

      const data = await res.json();
      setFavourites(data);

      if (data.length === 0) return;

      const fullData = await Promise.all(
        data.map(async (fav) => {
          const res = await fetch(
            `https://api.openverse.org/v1/images/${fav.image_id}`,
          );
          if (!res.ok) return null;
          return await res.json();
        }),
      );

      setFavouriteImages(fullData.filter(Boolean));
    };

    fetchFavourites();
  }, []);

  const removeFavourite = async (item) => {
    const res = await fetch(`${API_BASE}/api/favourites`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId: item.id }),
    });

    if (res.ok) {
      toast.success('Removed from favourites');
      setFavourites((prev) => prev.filter((f) => f.image_id !== item.id));
      setFavouriteImages((prev) => prev.filter((img) => img.id !== item.id));
    } else {
      toast.error('Failed to remove favourite');
    }
  };

  const renderImageCard = (item) => (
    <div key={item.id} className="relative">
      <Dialog>
        <DialogTrigger>
          <div className="relative cursor-pointer rounded-md bg-white p-2 shadow hover:shadow-lg dark:bg-[#11121E]">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="h-auto w-full rounded-t-md"
            />
            <DialogTitle className="text-md">{item.title}</DialogTitle>
          </div>
        </DialogTrigger>
        <DialogContent>
          <img
            src={item.thumbnail}
            alt={item.title}
            className="h-auto w-full rounded-md"
          />
          <h2 className="text-md text-center">{item.title}</h2>
          <p className="text-center text-sm">{item.url}</p>
          <div className="mt-4 flex justify-center gap-4">
            <Button
              onClick={() =>
                navigator.clipboard
                  .writeText(item.url)
                  .then(() => toast.success('URL copied'))
              }
              className="bg-blue-500 text-white hover:bg-blue-400"
            >
              Copy URL
            </Button>
            <Button
              onClick={() => removeFavourite(item)}
              className="bg-red-500 text-white hover:bg-red-400"
            >
              Remove
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = item.url;
                link.download = item.url.split('/').pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-green-500 text-white hover:bg-green-400"
            >
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => removeFavourite(item)}
        className="absolute left-1 top-1 z-10 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-400"
      >
        <FaHeart />
      </Button>
    </div>
  );

  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-lg border-2 bg-white p-8 shadow-md dark:bg-[#1E2938]">
      <div className="grid h-full grid-cols-5 gap-4 overflow-y-auto">
        {favouriteImages.length > 0 ? (
          favouriteImages.map(renderImageCard)
        ) : (
          <div className="col-span-5 text-center text-gray-500">
            No Favourites Found
          </div>
        )}
      </div>
    </div>
  );
}
