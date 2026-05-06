import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { X, MapPin, Check } from 'lucide-react'

const dotIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 18px; height: 18px;
    background: #3b82f6;
    border-radius: 50%;
    border: 2.5px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({ photo, onConfirm, onClose }) {
  const [position, setPosition] = useState(null)

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[1000] p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="font-semibold text-white">Set Photo Location</h3>
            <p className="text-xs text-slate-400 mt-0.5 break-all">{photo.original_filename}</p>
            <p className="text-xs text-slate-500 mt-0.5">Click anywhere on the map to pin the location</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map */}
        <div style={{ height: 380 }}>
          <MapContainer
            center={[20, 10]}
            zoom={2}
            style={{ height: '100%', width: '100%', background: '#0f172a' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onSelect={(lat, lng) => setPosition({ lat, lng })} />
            {position && <Marker position={[position.lat, position.lng]} icon={dotIcon} />}
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center gap-3 border-t border-slate-700">
          {position ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-300 flex-1 min-w-0">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-500 flex-1">No location selected</p>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => position && onConfirm(position.lat, position.lng)}
            disabled={!position}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            <Check className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
