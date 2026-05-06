import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/UI/Navbar'
import MapView from '../components/Map/MapView'
import UploadZone from '../components/Upload/UploadZone'
import Modal from '../components/UI/Modal'
import api from '../services/api'
import { MapPin, Calendar, HardDrive, Trash2, Navigation, X } from 'lucide-react'

export default function Dashboard() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [locationPickerPhoto, setLocationPickerPhoto] = useState(null)
  const [pendingLocation, setPendingLocation] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchPhotos = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/photos/?page=${p}&per_page=50`)
      setPhotos((prev) => (p === 1 ? res.data.items : [...prev, ...res.data.items]))
      setTotal(res.data.total)
      setPage(p)
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleUpload = async (files) => {
    setUploadError('')
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    setUploadProgress(0)
    try {
      const res = await api.post('/api/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) =>
          setUploadProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 50),
      })
      const newPhotos = res.data
      setPhotos((prev) => [...newPhotos, ...prev])
      setTotal((prev) => prev + newPhotos.length)

      // Prompt location picker for first photo missing GPS
      const noGps = newPhotos.find((p) => p.latitude === null)
      if (noGps) setLocationPickerPhoto(noGps)
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setUploadProgress(null)
    }
  }

  const handleLocationSet = async (photoId, lat, lng) => {
    try {
      const res = await api.patch(`/api/photos/${photoId}/coordinates`, {
        latitude: lat,
        longitude: lng,
      })
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? res.data : p)))
      if (selectedPhoto?.id === photoId) setSelectedPhoto(res.data)
    } finally {
      setLocationPickerPhoto(null)
      setPendingLocation(null)
    }
  }

  const handleMapClick = (lat, lng) => {
    if (locationPickerPhoto) {
      handleLocationSet(locationPickerPhoto.id, lat, lng)
    } else if (noGpsPhotos.length > 0) {
      setPendingLocation({ lat, lng })
    }
  }

  const handleDelete = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      await api.delete(`/api/photos/${photoId}`)
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      setTotal((prev) => prev - 1)
      setSelectedPhoto(null)
    } catch {
      // handled by interceptor
    }
  }

  const mappablePhotos = photos.filter((p) => p.latitude !== null && p.longitude !== null)
  const noGpsPhotos = photos.filter((p) => p.latitude === null)

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Map — fills remaining space */}
        <div className="flex-1 relative">
          {mappablePhotos.length === 0 && !loading && !locationPickerPhoto && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <p className="bg-slate-800/80 text-slate-400 text-sm px-4 py-2 rounded-lg border border-slate-700">
                {noGpsPhotos.length > 0
                  ? 'Click anywhere on the map to place a photo'
                  : 'Upload photos with GPS data to see them on the map'}
              </p>
            </div>
          )}

          {/* Selection mode banner */}
          {locationPickerPhoto && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-slate-800/95 border border-blue-500/60 rounded-xl px-4 py-2.5 shadow-xl">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-sm text-white">
                Click to place:{' '}
                <span className="text-blue-300 font-medium">{locationPickerPhoto.original_filename}</span>
              </span>
              <button
                onClick={() => setLocationPickerPhoto(null)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <MapView
            photos={mappablePhotos}
            onMarkerClick={locationPickerPhoto ? null : setSelectedPhoto}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden shrink-0">
            {/* Upload section */}
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-semibold text-white mb-3">Upload Photos</h2>
              <UploadZone onUpload={handleUpload} progress={uploadProgress} />
              {uploadError && (
                <p className="text-red-400 text-xs mt-2">{uploadError}</p>
              )}
            </div>

            {/* Photo grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">
                  Your Photos
                  <span className="ml-1.5 text-slate-500">({total})</span>
                </h3>
              </div>

              {loading && photos.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : photos.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-10">
                  No photos yet. Upload some!
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-700 hover:ring-2 hover:ring-blue-500 transition-all relative"
                    >
                      <img
                        src={`/api/photos/${photo.id}/thumbnail`}
                        alt={photo.original_filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {photo.latitude === null && (
                        <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-[9px] font-bold text-black text-center py-0.5">
                          NO GPS
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {photos.length < total && (
                <button
                  onClick={() => fetchPhotos(page + 1)}
                  disabled={loading}
                  className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  Load more
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo detail modal */}
      {selectedPhoto && (
        <Modal onClose={() => setSelectedPhoto(null)}>
          <div>
            <img
              src={`/api/photos/${selectedPhoto.id}/file`}
              alt={selectedPhoto.original_filename}
              className="w-full max-h-96 object-contain rounded-xl bg-slate-900/50"
            />
            <div className="mt-4 space-y-3">
              <h3 className="font-semibold text-white text-lg break-all">
                {selectedPhoto.original_filename}
              </h3>

              <div className="space-y-2 text-sm text-slate-400">
                {selectedPhoto.latitude !== null ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>No GPS coordinates</span>
                  </div>
                )}

                {selectedPhoto.taken_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{new Date(selectedPhoto.taken_at).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 shrink-0" />
                  <span>{(selectedPhoto.file_size / 1024).toFixed(0)} KB</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {selectedPhoto.latitude === null && (
                  <button
                    onClick={() => {
                      setLocationPickerPhoto(selectedPhoto)
                      setSelectedPhoto(null)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Set Location
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600/10 hover:bg-red-600/25 text-red-400 text-sm rounded-lg border border-red-600/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Place-photo modal: triggered by clicking empty map area */}
      {pendingLocation && (
        <Modal onClose={() => setPendingLocation(null)}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white text-lg">Place Photo</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {pendingLocation.lat.toFixed(5)}, {pendingLocation.lng.toFixed(5)} — select a photo to place here
            </p>
            <div className="grid grid-cols-3 gap-2">
              {noGpsPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handleLocationSet(photo.id, pendingLocation.lat, pendingLocation.lng)}
                  className="aspect-square rounded-lg overflow-hidden bg-slate-700 hover:ring-2 hover:ring-blue-500 transition-all relative group"
                  title={photo.original_filename}
                >
                  <img
                    src={`/api/photos/${photo.id}/thumbnail`}
                    alt={photo.original_filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
