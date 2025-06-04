import { createContext, useContext, useState, useEffect } from "react";

const TripSyncContext = createContext();

export const Tripsync = ({ children }) => {
    const handleAddToWishlist = async (item, isWishlisted, type) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to save favorites.");
            return;

        }

        try {
            const method = isWishlisted ? "DELETE" : "POST";
            const endpoint = isWishlisted
                ? `${import.meta.env.VITE_BACKEND_URL}wishlist/${item.place_id}`
                : `${import.meta.env.VITE_BACKEND_URL}wishlist`;

            const payload = isWishlisted
                ? null
                : JSON.stringify({
                    place_id: item.place_id || item.id,
                    name: item.name || item.displayName?.text || "Unnamed Place",
                    address: item.vicinity || item.formattedAddress || "Unknown Address",
                    rating: item.rating || null,
                    photo_reference: item.photos?.[0]?.photo_reference || item.photos?.[0]?.name || "",
                    type: type
                });


            await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                ...(payload && { body: payload }),
            });

        } catch (err) {
            console.error("Wishlist error:", err);
            alert("Something went wrong updating the wishlist.");
        }
    };

    const handleAddToItinerary = async (item, note = "") => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to add to itinerary.");
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}itinerary`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        location: item.displayName?.text || item.name || "Unknown",
                        address: item.address,
                        start_date: localStorage.getItem("start_date"),
                        end_date: localStorage.getItem("end_date"),
                        note: note,
                        location_image_url: item.photo_url || (
                            item.photo_reference
                                ? `https://places.googleapis.com/v1/${item.photo_reference}/media?maxWidthPx=400&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
                                : null
                        )
                    }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                alert(err.error || "Failed to add to itinerary");
                return;
            }

            alert("Added to itinerary!");
        } catch (err) {
            console.error("Itinerary error:", err);
            alert("Something went wrong.");
        }
    };

    return (
        <TripSyncContext.Provider value={{ handleAddToWishlist, handleAddToItinerary }}>
            {children}
        </TripSyncContext.Provider>
    );
};


export const useTripSyncContext = () => useContext(TripSyncContext);
