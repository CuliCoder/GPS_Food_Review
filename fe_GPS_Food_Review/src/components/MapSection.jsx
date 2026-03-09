import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RecenterMap = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }
    map.setView([location.lat, location.lng], 17, { animate: true });
  }, [location, map]);

  return null;
};

const MapSection = ({ userLocation, foods, activeFood, onResetLanguage }) => {
  const defaultCenter = [10.7723, 106.6982];
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <section className="map-shell">
      <header className="map-toolbar">
        <div>
          <p className="map-kicker">GPS Food Street</p>
          <h2>Live Food Map</h2>
        </div>
        <button type="button" className="toolbar-btn" onClick={onResetLanguage}>
          Change Language
        </button>
      </header>

      <div className="map-stage">
        <MapContainer center={center} zoom={16} className="map-canvas">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {userLocation && (
            <>
              <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={8} pathOptions={{ color: "#1f6feb" }}>
                <Popup>Your location</Popup>
              </CircleMarker>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={25}
                pathOptions={{ color: "#1f6feb", fillColor: "#1f6feb", fillOpacity: 0.08 }}
              />
            </>
          )}

          {foods.map((food) => {
            const isActive = activeFood?.id === food.id;
            return (
              <CircleMarker
                key={food.id}
                center={[food.lat, food.lng]}
                radius={isActive ? 11 : 8}
                pathOptions={{ color: isActive ? "#cf3f00" : "#d84e0f" }}
              >
                <Popup>
                  <strong>{food.name}</strong>
                  <br />
                  {food.specialty}
                  <br />
                  {food.address}
                </Popup>
              </CircleMarker>
            );
          })}

          <RecenterMap location={userLocation} />
        </MapContainer>
      </div>
    </section>
  );
};

export default MapSection;
