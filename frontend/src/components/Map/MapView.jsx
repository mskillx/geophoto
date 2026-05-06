import { MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import PhotoMarker from './PhotoMarker'

// Fix Leaflet's broken default icon path with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapView({ photos, onMarkerClick }) {
  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={1}
      className="w-full h-full"
      style={{ background: '#0f172a' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {photos.map((photo) => (
        <PhotoMarker key={photo.id} photo={photo} onClick={onMarkerClick} />
      ))}
    </MapContainer>
  )
}
