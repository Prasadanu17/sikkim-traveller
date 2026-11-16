import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Compass,
  Clock,
  Car,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  Mountain,
  Maximize2,
  Minimize2,
  Map as MapIcon
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { buildItineraryRouteModel } from "../../services/map/routeMapService";

export default function SikkimRouteMap({ itinerary, className = "" }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const linesLayerRef = useRef(null);

  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedLeg, setSelectedLeg] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // "map" or "circuit"
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive route model from itinerary
  const routeModel = useMemo(() => {
    return buildItineraryRouteModel(itinerary);
  }, [itinerary]);

  // Circuit badge colors
  const circuitColors = {
    "North Sikkim": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-700", hex: "#2563eb" },
    "East Sikkim": { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700", hex: "#059669" },
    "West Sikkim": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-700", hex: "#7c3aed" },
    "South Sikkim": { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-700", hex: "#d97706" }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode !== "map") return;
    if (!mapContainerRef.current) return;
    if (!routeModel.isValid || routeModel.stops.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Create map instance if not already created
      if (!leafletMapRef.current) {
        const initialCenter = routeModel.bounds ? routeModel.bounds.center : [27.5, 88.5];
        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 9,
          minZoom: 8,
          maxZoom: 14,
          scrollWheelZoom: false,
          attributionControl: true
        });

        // OpenStreetMap Tile Layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(map);

        leafletMapRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        linesLayerRef.current = L.layerGroup().addTo(map);
      }

      const map = leafletMapRef.current;
      const markersLayer = markersLayerRef.current;
      const linesLayer = linesLayerRef.current;

      markersLayer.clearLayers();
      linesLayer.clearLayers();

      // Plot route connection lines (actual sequence)
      const latLngs = [];
      routeModel.stops.forEach((stop) => {
        latLngs.push([stop.lat, stop.lng]);
      });

      if (latLngs.length > 1) {
        // Draw dashed illustrative transit line
        const polyline = L.polyline(latLngs, {
          color: "#0f382c", // Pine green
          weight: 3.5,
          opacity: 0.85,
          dashArray: "6, 8",
          lineCap: "round",
          lineJoin: "round"
        }).addTo(linesLayer);

        polyline.on("click", () => {
          setSelectedLeg(routeModel.legs[0] || null);
        });
      }

      // Plot destination markers with sequence badges
      routeModel.stops.forEach((stop, index) => {
        const colorHex = circuitColors[stop.circuit]?.hex || "#0f382c";
        
        // Custom modern HTML pin
        const customIcon = L.divIcon({
          className: "custom-sikkim-pin",
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background-color: ${colorHex};
              color: #ffffff;
              font-family: inherit;
              font-weight: 700;
              font-size: 13px;
              border-radius: 50%;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              ${index + 1}
            </div>
            <div style="
              text-align: center;
              background: rgba(15, 56, 44, 0.9);
              color: #fff;
              font-size: 10px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 2px;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            ">
              ${stop.name} (${stop.elevationM}m)
            </div>
          `,
          iconSize: [32, 54],
          iconAnchor: [16, 24]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customIcon });
        marker.on("click", () => {
          setSelectedStop(stop);
          setSelectedLeg(null);
        });
        marker.addTo(markersLayer);
      });

      // Fit map to markers bounds with comfortable padding
      if (routeModel.bounds) {
        const corner1 = L.latLng(routeModel.bounds.minLat, routeModel.bounds.minLng);
        const corner2 = L.latLng(routeModel.bounds.maxLat, routeModel.bounds.maxLng);
        const bounds = L.latLngBounds(corner1, corner2);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
      }

      setIsLoading(false);
      setMapError(null);
    } catch (err) {
      setMapError("Failed to initialize map view: " + err.message);
      setIsLoading(false);
    }

    return () => {
      // Map instance preserved across updates, destroyed on unmount
    };
  }, [viewMode, routeModel, isExpanded]);

  // Clean up Leaflet instance when component unmounts
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Handle invalid or empty route
  if (!routeModel.isValid) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 text-center text-neutral-500 space-y-2">
        <MapPin size={24} className="mx-auto text-neutral-400" />
        <h4 className="font-display font-semibold text-sm text-ink">Itinerary Map Unavailable</h4>
        <p className="text-xs text-neutral-400">{routeModel.error || "Please generate an itinerary with destinations."}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-neutral-200 rounded-3xl shadow-premium overflow-hidden transition-all duration-300 ${isExpanded ? "fixed inset-4 z-50 flex flex-col shadow-2xl" : "relative"} ${className}`}>
      
      {/* HEADER BAR */}
      <div className="bg-pine text-parchment px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-pine-light/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
            <Compass size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide flex items-center gap-2">
              Sikkim Circuit Route Map
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white/10 text-neutral-200 uppercase tracking-widest">
                {routeModel.stops.length} Stops
              </span>
            </h3>
            <p className="text-[11px] text-neutral-300">
              Interactive sequential itinerary path across {routeModel.circuits.join(", ")}
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-white/10 p-1 rounded-full flex items-center text-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded-full font-semibold transition ${viewMode === "map" ? "bg-gold text-pine" : "text-parchment hover:text-white"}`}
            >
              <span className="flex items-center gap-1"><MapIcon size={12} /> Map</span>
            </button>
            <button
              onClick={() => setViewMode("circuit")}
              className={`px-3 py-1 rounded-full font-semibold transition ${viewMode === "circuit" ? "bg-gold text-pine" : "text-parchment hover:text-white"}`}
            >
              <span className="flex items-center gap-1"><Layers size={12} /> Circuit View</span>
            </button>
          </div>

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-parchment flex items-center justify-center transition"
            title={isExpanded ? "Minimize map" : "Expand map"}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* CIRCUITS SUMMARY STRIP */}
      <div className="bg-neutral-50 px-5 py-2.5 border-b border-neutral-150 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Circuits:</span>
          {routeModel.circuits.map((c) => {
            const style = circuitColors[c] || circuitColors["East Sikkim"];
            return (
              <span key={c} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.border} ${style.text}`}>
                {c}
              </span>
            );
          })}
        </div>

        {routeModel.legs.length > 0 && (
          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Car size={13} className="text-gold-dark" />
              {routeModel.legs.length} Mountain Transit Legs
            </span>
          </div>
        )}
      </div>

      {/* MAP / CIRCUIT VIEWPORT */}
      <div className={`relative w-full ${isExpanded ? "flex-1 min-h-0" : "h-[420px] sm:h-[480px]"}`}>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-100/80 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-pine">
              <div className="w-4 h-4 border-2 border-pine border-t-transparent rounded-full animate-spin" />
              Loading Sikkim Route Map...
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {mapError && (
          <div className="absolute inset-0 bg-rose-50 flex items-center justify-center p-6 text-center z-10">
            <div className="space-y-2 text-rose-700">
              <AlertTriangle size={24} className="mx-auto" />
              <p className="text-xs font-semibold">{mapError}</p>
              <button
                onClick={() => setViewMode("circuit")}
                className="text-xs bg-rose-600 text-white px-4 py-1.5 rounded-full font-bold"
              >
                Switch to Circuit Diagram
              </button>
            </div>
          </div>
        )}

        {/* 1. LEAFLET OSM MAP CONTAINER */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full ${viewMode === "map" ? "block" : "hidden"}`}
        />

        {/* 2. VECTOR CIRCUIT TOPOLOGY VIEW (OFFLINE-RESILIENT) */}
        {viewMode === "circuit" && (
          <div className="w-full h-full bg-parchment/40 overflow-y-auto p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-pine">
                  Day-by-Day Transit Circuit
                </span>
                <span className="text-[11px] text-neutral-500">
                  Total {routeModel.stops.length} destinations sequenced
                </span>
              </div>

              {/* Sequential Destination Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {routeModel.stops.map((stop, i) => {
                  const style = circuitColors[stop.circuit] || circuitColors["East Sikkim"];
                  return (
                    <div
                      key={stop.slug}
                      onClick={() => setSelectedStop(stop)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedStop?.slug === stop.slug
                          ? "bg-pine text-parchment border-pine shadow-lg"
                          : "bg-white border-neutral-200 hover:border-gold hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedStop?.slug === stop.slug ? "bg-gold text-pine" : "bg-pine text-parchment"
                          }`}>
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="font-display font-bold text-sm leading-tight">{stop.name}</h4>
                            <span className="text-[10px] text-neutral-400 block">{stop.district} District</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.bg} ${style.border} ${style.text}`}>
                          {stop.elevationM}m
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Days: {stop.days.join(", ")}</span>
                        <span className="text-gold font-medium flex items-center gap-1">Details <ChevronRight size={12} /></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transit Legs List */}
              {routeModel.legs.length > 0 && (
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                    <Car size={13} className="text-gold-dark" /> Estimated Road Transit Legs
                  </h4>
                  <div className="space-y-2">
                    {routeModel.legs.map((leg) => (
                      <div
                        key={leg.id}
                        onClick={() => setSelectedLeg(leg)}
                        className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 cursor-pointer transition ${
                          selectedLeg?.id === leg.id ? "bg-gold/10 border-gold text-pine" : "bg-white border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{leg.from.name}</span>
                          <span className="text-neutral-400">→</span>
                          <span className="font-bold text-ink">{leg.to.name}</span>
                          <span className="text-[10px] text-neutral-400">(Day {leg.fromDay} → Day {leg.toDay})</span>
                        </div>
                        <div className="flex items-center gap-3 font-semibold text-neutral-600">
                          <span className="flex items-center gap-1 text-gold-dark"><Clock size={12} /> {leg.estimatedHours}</span>
                          <span className="text-neutral-400">~{leg.distanceKm} km</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELECTED DESTINATION POPOVER / DRAWER */}
        <AnimatePresence>
          {selectedStop && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl p-4 shadow-2xl z-20 space-y-2 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-pine text-gold text-[10px] font-bold flex items-center justify-center">
                      {selectedStop.stopSequenceIndex}
                    </span>
                    <h4 className="font-display font-bold text-base text-ink">{selectedStop.name}</h4>
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {selectedStop.circuit} • {selectedStop.district}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStop(null)}
                  className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-150 text-xs">
                <div className="bg-neutral-50 p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Elevation</span>
                  <span className="font-bold text-pine flex items-center gap-1 mt-0.5">
                    <Mountain size={12} className="text-gold-dark" /> {selectedStop.elevationM} m
                  </span>
                </div>
                <div className="bg-neutral-50 p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Scheduled Days</span>
                  <span className="font-bold text-ink mt-0.5 block">
                    Day {selectedStop.days.join(", ")}
                  </span>
                </div>
              </div>

              {selectedStop.titles.length > 0 && (
                <div className="text-[11px] text-neutral-600 bg-parchment/60 p-2 rounded-lg">
                  <span className="font-semibold block text-[10px] text-neutral-500 uppercase">Activities</span>
                  <span className="line-clamp-2">{selectedStop.titles[0]}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* SELECTED TRANSIT LEG DRAWER */}
          {selectedLeg && !selectedStop && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl p-4 shadow-2xl z-20 space-y-2 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center">
                    <Navigation size={13} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-ink leading-tight">
                      {selectedLeg.from.name} → {selectedLeg.to.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400">Day {selectedLeg.fromDay} to Day {selectedLeg.toDay} Transfer</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeg(null)}
                  className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-150 text-xs">
                <div className="bg-neutral-50 p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Drive Time</span>
                  <span className="font-bold text-pine flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-gold-dark" /> {selectedLeg.estimatedHours}
                  </span>
                </div>
                <div className="bg-neutral-50 p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block">Distance</span>
                  <span className="font-bold text-ink mt-0.5 block">
                    ~{selectedLeg.distanceKm} km
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-600 bg-parchment/60 p-2 rounded-lg">
                <span className="font-semibold block text-[10px] text-neutral-500 uppercase">Road Note</span>
                <span>{selectedLeg.transitNote} ({selectedLeg.travelMode})</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER DISCLAIMER */}
      <div className="bg-neutral-50 px-5 py-2.5 border-t border-neutral-200 flex items-center gap-2 text-[11px] text-neutral-500">
        <Info size={13} className="text-gold-dark shrink-0" />
        <span className="leading-tight">
          {routeModel.disclaimer}
        </span>
      </div>

    </div>
  );
}

