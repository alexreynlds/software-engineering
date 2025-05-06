import MainLayout from './components/layouts/MainLayout';
import ImageSearch from './components/ImageSearch';
import { useState } from 'react';
import { Button } from './components/ui/button';

function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <MainLayout>
      {/* Holder for the page buttons */}
      <div className="mb-4 flex items-center rounded-xl border-2 bg-white p-4 shadow-md dark:bg-[#1E2938]">
        <ul className="flex gap-4">
          <li>
            <Button
              className={`flex w-full items-center gap-2 bg-indigo-500 hover:bg-indigo-400 md:w-auto ${currentPage === 1 ? 'scale-110' : ''}`}
              onClick={() => {
                setCurrentPage(1);
              }}
            >
              Image Search
            </Button>
          </li>
          <li>
            <Button
              className={`flex w-full items-center gap-2 bg-indigo-500 hover:bg-indigo-400 md:w-auto ${currentPage === 2 ? 'scale-110' : ''}`}
              onClick={() => {
                setCurrentPage(2);
              }}
            >
              Favourites
            </Button>
          </li>
        </ul>
      </div>
      {/* Page one is image search */}
      {currentPage === 1 && <ImageSearch />}
      {/* Page two is video search */}
      {/* {currentPage === 2 && <FavouritesPage />} */}
    </MainLayout>
  );
}

export default Dashboard;
