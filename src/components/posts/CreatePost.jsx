import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const uploadMedia = async (file) => {
    const fileRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    const type = file.type.startsWith('image/') ? 'image' : 'video';
    return { url, type };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && files.length === 0) return;
    
    setLoading(true);
    try {
      const media = await Promise.all(files.map(uploadMedia));
      
      await addDoc(collection(db, 'posts'), {
        text,
        media,
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        createdAt: serverTimestamp()
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border rounded-lg resize-none"
          rows={4}
        />
        
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
            id="media-input"
          />
          <label
            htmlFor="media-input"
            className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg"
          >
            Add Media
          </label>
          
          <button
            type="submit"
            disabled={loading || (!text && files.length === 0)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreatePost
