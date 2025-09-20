import {appwriteConfig, database} from "~/appwrite/client";
import {ID, Query} from "appwrite";

export const getAllTrips = async (limit: number, offset: number) => {
    const allTrips = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
    )

    if(allTrips.total === 0) {
        console.error('No trips found');
        return { allTrips: [], total: 0 }
    }

    return {
        allTrips: allTrips.documents,
        total: allTrips.total,
    }
}

// NEW: Function to get trips for a specific user
export const getUserTrips = async (userId: string, limit: number = 10, offset: number = 0) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const userTrips = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [
                Query.equal('userId', userId), // Filter by user ID
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc('createdAt') // Order by creation date (newest first)
            ]
        );

        if(userTrips.total === 0) {
            console.log('No trips found for user:', userId);
            return { userTrips: [], total: 0 }
        }

        return {
            userTrips: userTrips.documents,
            total: userTrips.total,
        }
    } catch (error) {
        console.error('Error fetching user trips:', error);
        throw error;
    }
};

// NEW: Function to get upcoming trips for a user (if you have status/date fields)
export const getUpcomingUserTrips = async (userId: string, limit: number = 10, offset: number = 0) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const upcomingTrips = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [
                Query.equal('userId', userId), // Filter by user ID
                // Add more filters here if you have status or date fields
                // Query.equal('status', 'upcoming'),
                // Query.greaterThan('startDate', new Date().toISOString()),
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc('createdAt')
            ]
        );

        if(upcomingTrips.total === 0) {
            console.log('No upcoming trips found for user:', userId);
            return { upcomingTrips: [], total: 0 }
        }

        return {
            upcomingTrips: upcomingTrips.documents,
            total: upcomingTrips.total,
        }
    } catch (error) {
        console.error('Error fetching upcoming user trips:', error);
        throw error;
    }
};

export const getTripById = async (tripId: string) => {
    const trip = await database.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        tripId
    );

    if(!trip.$id) {
        console.log('Trip not found')
        return null;
    }

    return trip;
}


export const updateUserWishlist = async (userId: string, wishlist: string[]) => {
    try {
        // First, get the user document to find the document ID
        const user = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", userId)]
        );

        if (user.documents.length === 0) {
            throw new Error("User not found");
        }

        const documentId = user.documents[0].$id;

        // Now, update the user document with the new wishlist
        const updatedUser = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            documentId,
            {
                wishlist: wishlist,
            }
        );
        return updatedUser;
    } catch (error) {
        console.error('Error updating wishlist:', error);
        return null;
    }
};