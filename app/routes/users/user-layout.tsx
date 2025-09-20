import { useState, useEffect } from 'react';
import UpcomingTrips from 'components/UpcomingTrips';
import WelcomeSection from 'components/Welcome';
import Wishlist from 'components/Wishlist';
import RecommendedTrips from '../../../components/RecommendedTrips';
import { getUserTrips, getAllTrips, updateUserWishlist } from '~/appwrite/trips'; // Added getAllTrips import
import { getUser } from '~/appwrite/auth';
import { parseTripData } from '~/lib/utlis';
import { allTrips } from '~/constants'; // Keep this for RecommendedTrips

const UserLayout = () => {
  const [userTrips, setUserTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Keep the transformed trips for RecommendedTrips (demo data)
  const transformedTrips = allTrips.map(trip => ({
    ...trip,
    $id: trip.id.toString(),
    id: trip.id.toString(),
    interests: trip.tags,
    estimatedPrice: parseFloat(trip.estimatedPrice.replace(/[^0-9.]/g, '')) || 0
  }));

  // Function to fetch user's trips
  const fetchUserTrips = async () => {
    try {
      const currentUser = await getUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      setUser(currentUser);
      setWishlist(currentUser.wishlist || []);
      
      // TEMPORARY: Show all trips instead of user-specific trips
      // This is just to test that the component works
      // Remove this and uncomment the getUserTrips code below once you fix the userId issue
      // const response = await getAllTrips(10, 0);
      // console.log('All trips response:', response);
      
      // const formattedTrips = response.allTrips.map(({ $id, tripDetails, imageUrls }) => {
      //   console.log('Processing trip:', { $id, tripDetails, imageUrls });
      //   return {
      //     $id,
      //     id: $id,
      //     ...parseTripData(tripDetails),
      //     imageUrls: imageUrls ?? []
      //   };
      // });
      
      // console.log('Formatted trips:', formattedTrips);
      // return formattedTrips;
      
      // UNCOMMENT THIS WHEN USERID IS FIXED:
      const response = await getUserTrips(currentUser.accountId, 10, 0);
      console.log('User trips response:', response);
      const formattedTrips = response.userTrips.map(({ $id, tripDetails, imageUrls }) => ({
        $id,
        id: $id,
        ...parseTripData(tripDetails),
        imageUrls: imageUrls ?? []
      }));
      return formattedTrips;
      
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  };

  // Load trips on component mount
  useEffect(() => {
    const loadUserTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const trips = await fetchUserTrips();
        setUserTrips(trips);
      } catch (err) {
        setError(err.message || 'Failed to load trips');
        console.error('Error loading user trips:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserTrips();
  }, []);
  const toggleWishlist = async (tripId: string) => {
    const newWishlist = wishlist.includes(tripId)
      ? wishlist.filter(id => id !== tripId)
      : [...wishlist, tripId];

    setWishlist(newWishlist);

    if (user) {
      await updateUserWishlist(user.accountId, newWishlist);
    }
  };

  const wishlistedTrips = [
    ...userTrips,
    ...transformedTrips,
  ].filter(trip => wishlist.includes(trip.id));
  return (
    <div>
      <WelcomeSection />
      <div className="px-6 py-8 space-y-12 bg-gray-50 min-h-screen">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Trips</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your trips...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : (
            <UpcomingTrips 
              trips={userTrips} 
              onFetchTrips={fetchUserTrips}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          )}
        </section>

        <section id="wishlist">
          <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
          <Wishlist
            wishlistedTrips={wishlistedTrips}
            toggleWishlist={toggleWishlist}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Recommended Trips</h2>
          <RecommendedTrips trips={transformedTrips} />
        </section>
      </div>
    </div>
  );
};

export default UserLayout;