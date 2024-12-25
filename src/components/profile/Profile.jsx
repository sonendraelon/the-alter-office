import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Post from '../posts/Post';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setBio(docSnap.data().bio || '');
        }
        
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('userId', '==', id));
        const querySnapshot = await getDocs(q);
        
        const userPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleProfileUpdate = async () => {
    // Add profile update logic here
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <img
            src={profile?.photoURL || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <div className="ml-6">
            <h1 className="text-2xl font-bold">{profile?.displayName}</h1>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full mt-2 p-2 border rounded"
                rows={3}
              />
            ) : (
              <p className="mt-2 text-gray-600">{profile?.bio || 'No bio yet'}</p>
            )}
            
            {user.uid === id && (
              <button
                onClick={() => editing ? handleProfileUpdate() : setEditing(true)}
                className="mt-2 text-blue-500"
              >
                {editing ? 'Save' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
export default Profile