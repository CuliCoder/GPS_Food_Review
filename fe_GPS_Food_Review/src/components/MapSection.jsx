import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Thành phần để tự động cập nhật tâm bản đồ khi vị trí thay đổi
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);
  return null;
};

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

      <div className="map-placeholder" style={{ height: "400px", width: "100%" }}>
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {/* Đánh dấu vị trí bản thân */}
            <Marker position={[location.lat, location.lng]}>
              <Popup>Bạn đang ở đây</Popup>
            </Marker>

            {/* Đánh dấu các quán ăn (truyền từ props) */}
            {restaurants && restaurants.map((res, index) => (
              <Marker key={index} position={[res.lat, res.lng]}>
                <Popup>
                  <strong>{res.name}</strong> <br />
                  {res.address}
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