import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Thành phần để tự động cập nhật tâm bản đồ khi vị trí thay đổi
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);
  return null;
};

const vietnamIslandLabels = [
  {
    name: "Quần đảo Hoàng Sa (Việt Nam)",
    position: [16.5, 112.0],
  },
  {
    name: "Quần đảo Trường Sa (Việt Nam)",
    position: [9.8, 114.2],
  },
];

const userMarkerIcon = L.divIcon({
  className: "custom-map-marker user-marker",
  html: '<span class="marker-core"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const restaurantMarkerIcon = L.divIcon({
  className: "custom-map-marker restaurant-marker",
  html: '<span class="marker-core"></span><span class="marker-pin"></span>',
  iconSize: [30, 36],
  iconAnchor: [15, 34],
  popupAnchor: [0, -28],
});

const islandMarkerIcon = L.divIcon({
  className: "custom-map-marker island-marker",
  html: '<span class="marker-core"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapSection = ({ location, restaurants, onReset }) => {
  // Tọa độ mặc định (ví dụ: TP.HCM) nếu chưa có location
  const defaultPosition = [10.8231, 106.6297];

  return (
    <div className="map-full">
      <div className="map-header">
        <h3>📍 Bản Đồ Quán Ăn</h3>
        {onReset && (
          <button className="btn btn-sm btn-light reset-btn" onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      <div className="map-placeholder" style={{ height: "100%", width: "100%" }}>
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            minZoom={5}
            maxZoom={19}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />
            
            {/* Đánh dấu vị trí bản thân */}
            <Marker position={[location.lat, location.lng]} icon={userMarkerIcon}>
              <Popup>Bạn đang ở đây</Popup>
            </Marker>

            {/* Đánh dấu các quán ăn (truyền từ props) */}
            {restaurants && restaurants.map((res, index) => (
              <Marker key={index} position={[res.lat, res.lng]} icon={restaurantMarkerIcon}>
                <Popup>
                  <strong>{res.name}</strong> <br />
                  {res.address}
                </Popup>
              </Marker>
            ))}

            {vietnamIslandLabels.map((item) => (
              <Marker key={item.name} position={item.position} icon={islandMarkerIcon}>
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  {item.name}
                </Tooltip>
                <Popup>
                  <strong>{item.name}</strong>
                </Popup>
              </Marker>
            ))}

            <RecenterAutomatically lat={location.lat} lng={location.lng} />
          </MapContainer>
        ) : (
          <div className="map-content">
            <p>Đang lấy vị trí...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSection;