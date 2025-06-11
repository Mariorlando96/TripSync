import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import confetti from "canvas-confetti";
import "../css/SyncSpin.css";
import rigoPhoto from "../assets/img/rigo-baby.jpg";
import Spinner from "../components/Spinner";

const cities = [
    "Paris", "Tokyo", "New York", "Sydney", "Barcelona",
    "Rio de Janeiro", "Rome", "Madrid", "London", "Cairo",
    "Dublin", "Istanbul", "San Francisco", "Berlin", "Mexico City",
    "Vancouver", "Seoul", "Johannesburg", "Buenos Aires", "Amsterdam", "Miami", "Seattle",
];

const getRandomRotation = () => {
    const spins = 5 + Math.floor(Math.random() * 5);
    const stopAngle = (360 / cities.length) * Math.floor(Math.random() * cities.length);
    return spins * 360 + stopAngle;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const getPhotoUrl = (place) => {
    if (place.photo_url) return place.photo_url;
    if (place.photos?.length > 0 && place.photos[0].name) {
        return `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${GOOGLE_API_KEY}`;
    }
    return rigoPhoto;
};

const getAddress = (place) => {
    return place.formattedAddress || place.vicinity || "Address not available";
};

const SyncSpin = () => {
    const [selectedCity, setSelectedCity] = useState("");
    const [hotel, setHotel] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [attraction, setAttraction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const controls = useAnimation();
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const radius = canvas.width / 2;
        const angleStep = (2 * Math.PI) / cities.length;

        const drawWheel = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cities.forEach((city, i) => {
                const startAngle = i * angleStep;
                const endAngle = startAngle + angleStep;
                ctx.beginPath();
                ctx.moveTo(radius, radius);
                ctx.arc(radius, radius, radius, startAngle, endAngle);
                ctx.fillStyle = `hsl(${(i * 360) / cities.length}, 70%, 60%)`;
                ctx.fill();

                ctx.save();
                ctx.translate(radius, radius);
                ctx.rotate(startAngle + angleStep / 2);
                ctx.fillStyle = "#fff";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "right";
                ctx.fillText(city, radius - 10, 5);
                ctx.restore();
            });
        };

        drawWheel();
    }, [selectedCity]);

    const fetchData = async (city) => {
        setLoading(true);
        setError("");
        try {
            const hotelRes = await fetch(`${BACKEND_URL}hotels?destination=${encodeURIComponent(city)}`);
            const baseHotels = await hotelRes.json();

            let selectedHotel = null;

            for (const hotel of baseHotels) {
                if (!hotel.id) continue;

                const detailsRes = await fetch(`${BACKEND_URL}place-details/${hotel.id}`);
                if (!detailsRes.ok) continue;

                const details = await detailsRes.json();

                const photoName = details?.photos?.[0]?.name;
                const photoUrl = photoName ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${GOOGLE_API_KEY}` : null;

                selectedHotel = {
                    ...hotel,
                    ...details,
                    photo_url: photoUrl,
                    place_id: hotel.id,
                    name: details.displayName?.text,
                };

                break;
            }

            setHotel(selectedHotel);

            const attrRes = await fetch(`${BACKEND_URL}attractions?destination=${encodeURIComponent(city)}`);
            const attrData = await attrRes.json();
            const baseAttractions = attrData.results || [];

            let selectedRestaurant = null;
            let selectedAttraction = null;

            for (const place of baseAttractions) {
                const placeId = place.place_id || place.id;
                if (!placeId) continue;

                const detailsRes = await fetch(`${BACKEND_URL}place-details/${placeId}`);
                if (!detailsRes.ok) continue;

                const details = await detailsRes.json();

                const photoName = place?.photos?.[0]?.name;
                const photoUrl = photoName ? `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${GOOGLE_API_KEY}` : null;

                const enrichedPlace = {
                    ...place,
                    ...details,
                    photo_url: photoUrl,
                    place_id: placeId,
                    name: details.displayName?.text,
                };

                if (!selectedRestaurant && enrichedPlace.types?.some(type => type.toLowerCase().includes("restaurant"))) {
                    selectedRestaurant = enrichedPlace;
                }

                if (!selectedAttraction && !enrichedPlace.types?.some(type => type.toLowerCase().includes("restaurant"))) {
                    selectedAttraction = enrichedPlace;
                }

                if (selectedRestaurant && selectedAttraction) break;
            }

            setRestaurant(selectedRestaurant);
            setAttraction(selectedAttraction);

            if (selectedHotel && selectedRestaurant && selectedAttraction) {
                setTimeout(() => {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }, 100);
            }

        } catch (err) {
            console.error("Error fetching SyncSpin data:", err);
            setError("Oops! Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    const spinWheel = async () => {
        const newRotation = getRandomRotation();

        const anglePerCity = 360 / cities.length;
        const adjustedAngle = (360 - (newRotation % 360) + 90) % 360;
        const finalIndex = Math.floor(adjustedAngle / anglePerCity) % cities.length;
        const selected = cities[finalIndex];



        await controls.start({
            rotate: newRotation,
            transition: {
                type: "tween",
                duration: 4,
                ease: "easeOut"
            },
        });

        setSelectedCity(selected);
        fetchData(selected);
    };

    return (
        <div className="container-fluid">
            <div className="row justify-content-center align-items-center my-5">
                <div className="col-sm-12 col-md-8 col-lg-6 col-xxl-3 text-center wheel-wrapper">
                    <div className="wheel-canvas-wrapper position-relative">
                        <div className="wheel-marker"></div>
                        <motion.canvas
                            className="wheel-canvas"
                            width="300"
                            height="300"
                            animate={controls}
                            ref={canvasRef}
                        />
                    </div>
                    <h1 className="destination-announce mt-4 display-2">Your next destination:</h1>
                    {selectedCity && (
                        <motion.h2
                            className="selected-city display-1"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <strong>{selectedCity}!</strong>
                        </motion.h2>
                    )}
                </div>
                <div className="col-sm-12 col-md-8 col-lg-6 col-xxl-3 jumbo-wrapper">
                    <div className="jumbotron-container text-center">
                        <h1 className="display-4 jumbo-header">What is SyncSpin?</h1>
                        <p className="lead jumbo-body">
                            Not sure where to jet-off to next? Leave that to SyncSpin. Spin the wheel - we'll take care of the rest!
                        </p>
                        <button type="button" className="btn btn-outline-dark spin-button" onClick={spinWheel}>
                            <div className="display-6">Spin the Wheel!</div>
                        </button>
                    </div>
                </div>
            </div>
            {error && (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center my-5">
                    <Spinner />
                    <p className="mt-2">Fetching your perfect trip...</p>
                </div>
            ) : (
                <div className="container">
                    <div className="row justify-content-center">
                        {hotel && (
                            <div className="col-sm-12 col-md-6 col-lg-4 d-flex flex-column align-items-center mb-4">
                                <h1 className="display-4 text-center mb-3">Hotel</h1>
                                <div className="card sync-card" style={{ width: "18rem" }}>
                                    <img src={getPhotoUrl(hotel)} className="card-img-top sync-card-img-top" alt={hotel.name} />
                                    <button className="btn btn-primary sync-itinerary-button" onClick={() => saveToItinerary(hotel, "Hotel")}>
                                        Add to Itinerary
                                    </button>
                                    <div className="card-body sync-card-body">
                                        <h5 className="card-title">{hotel.name}</h5>
                                        <p className="card-text sync-card-text">{getAddress(hotel)}</p>
                                        {hotel.rating && (
                                            <p className="card-text sync-card-text">⭐ Rating: {hotel.rating}</p>
                                        )}
                                        {hotel.userRatingCount || hotel.user_ratings_total ? (
                                            <p className="card-text sync-card-text">
                                                📈 Reviews: {hotel.userRatingCount || hotel.user_ratings_total}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="card-footer sync-card-footer">
                                        <a
                                            className="btn btn-outline-primary sync-maps-button"
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.displayName?.text || "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa-solid fa-location-dot"></i>View on Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {restaurant && (
                            <div className="col-sm-12 col-md-6 col-lg-4 d-flex flex-column align-items-center mb-4">
                                <h1 className="display-4 text-center mb-3">Restaurant</h1>
                                <div className="card sync-card" style={{ width: "18rem" }}>
                                    <img src={getPhotoUrl(restaurant)} className="card-img-top sync-card-img-top" alt={restaurant.name} />
                                    <button className="btn btn-primary sync-itinerary-button" onClick={() => saveToItinerary(restaurant, "Restaurant")}>
                                        Add to Itinerary
                                    </button>
                                    <div className="card-body sync-card-body">
                                        <h5 className="card-title">{restaurant.name}</h5>
                                        <p className="card-text sync-card-text">{getAddress(restaurant)}</p>
                                        {restaurant.rating && (
                                            <p className="card-text sync-card-text">⭐ Rating: {restaurant.rating}</p>
                                        )}
                                        {restaurant.userRatingCount || restaurant.user_ratings_total ? (
                                            <p className="card-text sync-card-text">
                                                📈 Reviews: {restaurant.userRatingCount || restaurant.user_ratings_total}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="card-footer sync-card-footer">
                                        <a
                                            className="btn btn-outline-primary sync-maps-button"
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.displayName?.text || "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa-solid fa-location-dot"></i>View on Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {attraction && (
                            <div className="col-sm-12 col-md-6 col-lg-4 d-flex flex-column align-items-center mb-4">
                                <h1 className="display-4 text-center mb-3">Attraction</h1>
                                <div className="card sync-card" style={{ width: "18rem" }}>
                                    <img src={getPhotoUrl(attraction)} className="card-img-top sync-card-img-top" alt={attraction.name} />
                                    <button className="btn btn-primary sync-itinerary-button" onClick={() => saveToItinerary(attraction, "Attraction")}>
                                        Add to Itinerary
                                    </button>
                                    <div className="card-body sync-card-body">
                                        <h5 className="card-title">{attraction.name}</h5>
                                        <p className="card-text sync-card-text">{getAddress(attraction)}</p>
                                        {attraction.rating && (
                                            <p className="card-text sync-card-text">⭐ Rating: {attraction.rating}</p>
                                        )}
                                        {attraction.userRatingCount || attraction.user_ratings_total ? (
                                            <p className="card-text sync-card-text">
                                                📈 Reviews: {attraction.userRatingCount || attraction.user_ratings_total}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="card-footer sync-card-footer">
                                        <a
                                            className="btn btn-outline-primary sync-maps-button"
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.displayName?.text || "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <i className="fa-solid fa-location-dot"></i>View on Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyncSpin;
