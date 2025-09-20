import React, { useState, useRef, useEffect } from "react";
import TripCard from "./TripCard";
import {
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";

interface Trip {
  $id: string;
  id: string;
  name: string;
  imageUrls: string[];
  itinerary?: Array<{ location: string }>;
  interests?: string[];
  travelStyle?: string;
  estimatedPrice?: number;
}

interface UpcomingTripsProps {
  trips?: Trip[];
  onFetchTrips?: () => Promise<Trip[]>;
  refreshTrigger?: number;
  wishlist: string[];
  toggleWishlist: (tripId: string) => void;
}

const UpcomingTrips: React.FC<UpcomingTripsProps> = ({
  trips: initialTrips = [],
  onFetchTrips,
  refreshTrigger = 0,
  wishlist,
  toggleWishlist,
}) => {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch trips
  const fetchTrips = async () => {
    if (!onFetchTrips) return;
    try {
      setLoading(true);
      setError(null);
      const fetchedTrips = await onFetchTrips();
      setTrips(fetchedTrips);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  // Refetch when parent triggers
  useEffect(() => {
    if (onFetchTrips && refreshTrigger > 0) {
      fetchTrips();
    }
  }, [refreshTrigger]);

  // Update local state if initialTrips prop changes
  useEffect(() => {
    if (initialTrips?.length > 0) {
      setTrips(initialTrips);
    }
  }, [initialTrips]);

  // Scrolling
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const currentRef = scrollRef.current;
    currentRef?.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);
    return () => {
      currentRef?.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [trips]);

  // Early empty state
  if (!trips || trips.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Trips
          </h2>
          {loading ? (
            <div className="py-16">
              <FaSpinner className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading trips...
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch your adventures
              </p>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-gray-600">No upcoming trips yet.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900"></h2>
          {onFetchTrips && (
            <button
              onClick={fetchTrips}
              disabled={loading}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              {loading ? "Loading..." : "Refresh"}
            </button>
          )}
        </div>

        {/* Scrollable container */}
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 rounded-full p-3 shadow-lg border border-gray-200 transition-all"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 rounded-full p-3 shadow-lg border border-gray-200 transition-all"
              aria-label="Scroll right"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
          >
            {trips.map((trip) => {
              const tags = [
                ...(trip.interests || []),
                ...(trip.travelStyle ? [trip.travelStyle] : []),
              ].filter(Boolean);

              return (
                <div
                  key={trip.id}
                  className="relative group flex-shrink-0 w-[280px]"
                >
                  {/* Wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(trip.id);
                    }}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={
                      wishlist.includes(trip.id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {wishlist.includes(trip.id) ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-5 h-5" />
                    )}
                  </button>

                  <TripCard
                    id={trip.id.toString()}
                    name={trip.name}
                    imageUrl={trip.imageUrls[0]}
                    location={trip.itinerary?.[0]?.location ?? ""}
                    tags={[trip.interests!, trip.travelStyle!]}
                    price={`${trip.estimatedPrice ?? ""}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingTrips;

