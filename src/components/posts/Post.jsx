import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const Post = ({ post }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.text,
        text: post.text,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${post.userId}`}>
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="w-10 h-10 rounded-full"
          />
        </Link>
        <div className="ml-3">
          <Link to={`/profile/${post.userId}`}>
            <h3 className="font-semibold">{post.userName}</h3>
          </Link>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      <p className="mb-4">{post.text}</p>
      
      {post.media.map((media, index) => (
        <div key={index} className="mb-4">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={`Post ${index + 1}`}
              className="rounded-lg w-full"
            />
          ) : (
            <video
              ref={videoRef}
              src={media.url}
              className="rounded-lg w-full"
              loop
              muted
              playsInline
            />
          )}
        </div>
      ))}
      
      <div className="flex justify-between items-center">
        <button
          onClick={handleShare}
          className="text-gray-500 hover:text-gray-700"
        >
          Share
        </button>
      </div>
    </div>
  );
};
export default Post;