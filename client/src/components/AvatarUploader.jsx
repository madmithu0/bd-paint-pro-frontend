import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import api from '../api';

const AvatarUploader = ({
  currentPhoto = '',
  userName = 'User',
  onUploadSuccess,
  onResetSuccess,
}) => {
  const [previewUrl, setPreviewUrl] = useState(currentPhoto);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Maximum file size limit is 5MB.');
      return;
    }

    try {
      setUploading(true);
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        fileType: 'image/webp',
      });

      const localPreview = URL.createObjectURL(compressedFile);
      setPreviewUrl(localPreview);

      const formData = new FormData();
      formData.append('avatar', compressedFile, 'avatar.webp');

      const response = await api.patch('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        const uploadedUrl = response.data.profilePhoto;
        setPreviewUrl(uploadedUrl);
        setSuccessMsg('Profile photo updated successfully.');
        if (onUploadSuccess) onUploadSuccess(uploadedUrl);
      }
    } catch (err) {
      setPreviewUrl(currentPhoto);
      setErrorMsg(
        err.response?.data?.message || 'Failed to upload profile photo.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetPhoto = async () => {
    if (!previewUrl) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setResetting(true);
      const response = await api.delete('/users/profile-photo');
      if (response.data && response.data.success) {
        setPreviewUrl('');
        setSuccessMsg('Profile photo removed.');
        if (onResetSuccess) onResetSuccess();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to reset profile photo.'
      );
    } finally {
      setResetting(false);
    }
  };

  const initials = String(userName || 'U')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-600 bg-indigo-50 dark:bg-gray-700 flex items-center justify-center">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            {initials}
          </span>
        )}
        {(uploading || resetting) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-semibold">
            Processing...
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          disabled={uploading || resetting}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change Photo'}
        </button>

        {previewUrl && (
          <button
            type="button"
            disabled={uploading || resetting}
            onClick={handleResetPhoto}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-gray-700 dark:text-red-400 rounded-lg disabled:opacity-50"
          >
            {resetting ? 'Removing...' : 'Remove'}
          </button>
        )}
      </div>

      {errorMsg && (
        <p className="mt-2 text-xs text-red-600 font-medium">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="mt-2 text-xs text-green-600 font-medium">{successMsg}</p>
      )}
    </div>
  );
};

export default AvatarUploader;
