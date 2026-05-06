import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

function makeIcon(photoId) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: #1e293b;
        border: 2.5px solid #3b82f6;
        box-shadow: 0 3px 10px rgba(0,0,0,0.6);
        overflow: hidden;
      ">
        <img
          src="/api/photos/${photoId}/thumbnail"
          style="width:100%;height:100%;object-fit:cover;transform:rotate(45deg) scale(1.45);"
          onerror="this.parentElement.style.background='#3b82f6'"
        />
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -54],
  })
}

export default function PhotoMarker({ photo, onClick }) {
  return (
    <Marker
      position={[photo.latitude, photo.longitude]}
      icon={makeIcon(photo.id)}
      eventHandlers={{ click: () => onClick(photo) }}
    >
      <Popup>
        <div style={{ width: 160, textAlign: 'center' }}>
          <img
            src={`/api/photos/${photo.id}/thumbnail`}
            alt={photo.original_filename}
            style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 6 }}
          />
          <p style={{ margin: '6px 0 4px', fontWeight: 600, fontSize: 12, wordBreak: 'break-all' }}>
            {photo.original_filename}
          </p>
          <button
            onClick={() => onClick(photo)}
            style={{
              padding: '4px 14px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
