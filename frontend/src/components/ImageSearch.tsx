import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { DialogTrigger, Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { FaHeart } from 'react-icons/fa';

// The image search component of the dashboard
//
// Allows the user to search through Openverse and view images, favouriting them if they wish
// Users can also view just their favourites and remove them if they want
//
// Favourites are stored in the backend databased and fetched when the component mounts
// allowing them to persist across sessions
export default function ImageSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [favouriteImages, setFavouriteImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchFavourites = async () => {
      const res = await fetch('http://localhost:5050/api/favourites', {
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Failed to fetch favourites');
        return;
      }

      const data = await res.json(); // [{ image_id: "uuid" }]
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

  const handleSearch = async (e?, customQuery?: string, pageNumArg?) => {
    if (e) e.preventDefault();

    const finalQuery = customQuery || query;
    if (!finalQuery) return;

    const pageToFetch = pageNumArg ?? (customQuery ? 1 : page);
    setPage(pageToFetch);

    // Update search history
    setSearchHistory((prev) => {
      const updated = [finalQuery, ...prev.filter((q) => q !== finalQuery)];
      return updated.slice(0, 5);
    });

    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${finalQuery}&page_size=10&page=${pageToFetch}`,
    );
    const data = await res.json();

    setSearchResults(data.results);
    setPage(pageToFetch);
    setTotalPages(data.page_count);
    setIsFocused(false);
    inputRef.current.blur();
  };

  const toggleFavourite = async (item) => {
    const isFavourited = favourites.some((f) => f.image_id === item.id);
    const method = isFavourited ? 'DELETE' : 'POST';

    const res = await fetch('http://localhost:5050/api/favourites', {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: item.id }),
    });

    if (res.ok) {
      toast.success(
        isFavourited ? 'Removed from favourites' : 'Added to favourites',
      );

      const updated = await fetch('http://localhost:5050/api/favourites', {
        credentials: 'include',
      });
      const data = await updated.json();
      setFavourites(data);

      const imageData = await Promise.all(
        data.map(async (fav) => {
          const res = await fetch(
            `https://api.openverse.org/v1/images/${fav.image_id}`,
          );
          if (!res.ok) return null;
          return await res.json();
        }),
      );
      setFavouriteImages(imageData.filter(Boolean));
    } else {
      toast.error('Failed to update favourites');
    }
  };

  const handleCopyURL = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL copied to clipboard');
    });
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderImageCard = (item) => {
    const isFavourited = favourites.some((f) => f.image_id === item.id);

    return (
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
                onClick={() => handleCopyURL(item.url)}
                className="bg-blue-500 text-white hover:bg-blue-400"
              >
                Copy URL
              </Button>
              <Button
                onClick={() => toggleFavourite(item)}
                className={`${isFavourited ? 'bg-red-500' : 'bg-gray-500'
                  } text-white hover:bg-red-400`}
              >
                {isFavourited ? 'Unfavourite' : 'Favourite'}
              </Button>
              <Button
                onClick={() => handleDownload(item.url)}
                className="bg-green-500 text-white hover:bg-green-400"
              >
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(item);
          }}
          className={`absolute left-1 top-1 z-10 rounded-full p-1 shadow ${isFavourited ? 'bg-red-500 text-white' : 'bg-white text-gray-500'
            } hover:bg-red-300`}
        >
          <FaHeart />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-lg border-2 bg-white p-8 shadow-md dark:bg-[#1E2938]">
      <div className="flex w-full flex-col gap-4">
        {/* Form only used for search view */}
        <form
          onSubmit={handleSearch}
          className="mb-4 flex w-full flex-col justify-center md:flex-row"
        >
          <div className="relative w-full">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search Openverse..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-r-none border border-gray-400 p-2"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 100)}
            />
            {isFocused && searchHistory.length > 0 && (
              <ul className="z-15 absolute left-0 right-0 mt-2 rounded border border-gray-300 bg-white text-sm shadow dark:border-[#444] dark:bg-[#1E2938]">
                {searchHistory.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={async () => {
                      setQuery(item);
                      setIsFocused(false);
                      await handleSearch(null, item);
                    }}
                    className="relative w-full border-b-2 p-2 text-left hover:bg-gray-200 dark:hover:bg-[#444]"
                  >
                    {item}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchHistory((prev) =>
                          prev.filter((q) => q !== item),
                        );
                      }}
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-red-500"
                    >
                      &times;
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            type="submit"
            className="w-48 rounded-l-none bg-blue-500 p-2 text-white"
          >
            SEARCH
          </Button>
        </form>

        {/* Results grid */}
        <div className="grid h-full grid-cols-5 gap-4 overflow-y-auto">
          {searchResults.map((item) => renderImageCard(item))}

          {searchResults.length === 0 && (
            <div className="col-span-5 text-center text-gray-500">
              No search results found
            </div>
          )}
        </div>

        {/* Pagination (only for search) */}
        {searchResults.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              disabled={page <= 1}
              onClick={() => handleSearch(null, query, page - 1)}
            >
              {'<<'}
            </Button>
            <span className="text-sm dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page >= totalPages}
              onClick={() => handleSearch(null, query, page + 1)}
            >
              {'>>'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
