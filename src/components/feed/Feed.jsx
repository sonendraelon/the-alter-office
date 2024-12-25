import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Post from '../posts/Post';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    
    setLoading(true);
    try {
      const postsRef = collection(db, 'posts');
      let q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
      
      if (lastDoc && !isInitial) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts();
    }
  }, [loading, hasMore]);

  const [sentryRef] = useInfiniteScroll(loadMore);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        {posts.map(post => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentryRef} className="h-10 flex items-center justify-center">
          {loading && <span>Loading...</span>}
        </div>
      )}
    </div>
  );
};

export default Feed;