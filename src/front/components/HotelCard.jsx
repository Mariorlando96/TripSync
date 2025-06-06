import React, { useState } from "react";
import { useTripSyncContext } from "../../contextapi";
import "../css/HotelCard.css";

export const HotelCard = ({ hotel, onToggleWishlist, isWishlisted }) => {
    const { handleAddToWishlist, handleAddToItinerary } = useTripSyncContext();
    const [imageLoaded, setImageLoaded] = useState(true); // ✅ Image load status

    const photoUrl =
        hotel?.photos?.[0]?.name &&
        `https://places.googleapis.com/v1/${hotel.photos[0].name}/media?maxWidthPx=400&key=${import.meta.env.VITE_GOOGLE_API_KEY}`;

    if (!hotel?.photos?.[0]?.name) {
        console.warn("Missing photo for hotel:", hotel.name, hotel);
        return null; // ❌ Don't render card if no photo at all
    }

    if (!imageLoaded) return null; // ❌ Don't render card if image failed

    return (
        <div
            className="card shadow-sm position-relative border-0 hotel-card"
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            <div className="position-relative">
                <img
                    src={photoUrl}
                    alt={hotel.displayName?.text || "Hotel"}
                    onLoad={() => setImageLoaded(true)} // ✅ Confirm image is OK
                    onError={() => {
                        console.warn("Could not load image for:", hotel.displayName?.text, hotel.photos?.[0]?.name);
                        setImageLoaded(false); // ❌ Hide on failure
                    }}
                    className="card-img-top hotel-img"
                />

                {/* Heart button */}
                <button
                    className="position-absolute top-0 end-0 m-2 border-0 bg-white rounded-circle shadow-sm wishlist-btn"
                    onClick={() => {
                        handleAddToWishlist(hotel, isWishlisted, "hotel");
                        onToggleWishlist(hotel);
                    }}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <i className={`bi ${isWishlisted ? "bi-heart-fill text-danger" : "bi-heart"}`}></i>
                </button>

                {/* Add to itinerary */}
                <button
                    className="btn btn-sm btn-primary w-100 mt-2"
                    onClick={() => { handleAddToItinerary(hotel) }}
                >
                    <i className="bi bi-suitcase2-fill me-1"></i> Add to Itinerary
                </button>
            </div>

            <div className="card-body px-3 pt-0 pb-2 d-flex flex-column">
                <h6 className="card-title mb-1">{hotel.displayName?.text}</h6>
                <p className="text-muted small mb-2">{hotel.formattedAddress}</p>

                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="badge bg-light text-dark px-2 py-1">
                        ⭐ {hotel.rating || "N/A"}
                    </span>
                    <a
                        className="btn btn-sm btn-outline-primary"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.displayName?.text || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="bi bi-geo-alt-fill me-1"></i> Maps
                    </a>
                </div>
            </div>
        </div>
    );
};
