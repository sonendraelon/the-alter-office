import { useInView } from 'react-intersection-observer';

const useInfiniteScroll = (callback) => {
  const [ref, inView] = useInView({
    threshold: 0,
  });

  React.useEffect(() => {
    if (inView) {
      callback();
    }
  }, [callback, inView]);

  return [ref];
};

export default useInfiniteScroll;