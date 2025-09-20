import TripCard from "./TripCard";
import { FaHeart } from "react-icons/fa";

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

interface WishlistProps {
  wishlistedTrips: Trip[];
  toggleWishlist: (tripId: string) => void;
}

const Wishlist: React.FC<WishlistProps> = ({
  wishlistedTrips,
  toggleWishlist,
}) => {
  if (wishlistedTrips.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {wishlistedTrips.map(trip => (
        <div key={trip.id} className="relative group">
          <button
            onClick={() => toggleWishlist(trip.id)}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 shadow-md"
            aria-label="Remove from wishlist"
          >
            <FaHeart className="w-5 h-5" />
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
      ))}
    </div>
  );
};

export default Wishlist;
