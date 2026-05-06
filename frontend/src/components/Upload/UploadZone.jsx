import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tiff', '.tif'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
}

export default function UploadZone({ onUpload, progress }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) onUpload(accepted)
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer select-none transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-400 hover:bg-slate-700/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-7 h-7 mx-auto mb-2 transition-colors ${
            isDragActive ? 'text-blue-400' : 'text-slate-500'
          }`}
        />
        <p className="text-slate-300 text-sm font-medium">
          {isDragActive ? 'Drop photos here' : 'Drag & drop photos'}
        </p>
        <p className="text-slate-500 text-xs mt-0.5">or click to browse</p>
        <p className="text-slate-600 text-xs mt-1.5">JPG · PNG · WebP · TIFF · HEIC</p>
      </div>

      {progress !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
