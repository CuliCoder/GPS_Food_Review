import React from "react";

const MapSection = ({ location, onReset }) => {
  return (
    <div className="map-full">
      <div className="map-header">
        <h3>📍 Bản Đồ Quán Ăn</h3>
        {onReset && (
          <button className="btn btn-sm btn-light reset-btn" onClick={onReset}>
            <img
              src="https://img.icons8.com/?size=100&id=ZyVBwElMucLt&format=png&color=3DD9EB"
              alt="Reset"
              className="reset-icon"
            />
            Reset
          </button>
        )}
      </div>
      <div className="map-placeholder">
        <div className="map-content">
          {location ? (
            <p>
              Vị trí: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          ) : (
            <p>Đang lấy vị trí...</p>
          )}
          <p className="map-info">Bản đồ sẽ hiển thị ở đây</p>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
