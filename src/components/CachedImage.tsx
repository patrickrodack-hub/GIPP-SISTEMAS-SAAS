import React, { useState, useEffect, memo } from 'react';
import { getMedia, storeMedia } from '../lib/indexedDbService';

export const CachedImage = memo(({ src, cacheKey, className, alt = "", referrerPolicy = "no-referrer", ...props }: any) => {
  const [localSrc, setLocalSrc] = useState<string | null>(src);

  useEffect(() => {
    if (!src) {
      setLocalSrc(null);
      return;
    }

    let isMounted = true;
    const finalKey = cacheKey || (src.startsWith('data:') ? `data_hash_${src.substring(0, 80)}` : src);

    if (src.startsWith('data:')) {
      setLocalSrc(src);
      storeMedia(finalKey, src).catch(() => {});
      return;
    }

    getMedia(finalKey)
      .then((cached) => {
        if (!isMounted) return;
        if (cached) {
          setLocalSrc(cached);
        } else {
          setLocalSrc(src);
          if (src.startsWith('http')) {
            fetch(src, { mode: 'cors' })
              .then(res => res.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (reader.result && isMounted) {
                    storeMedia(finalKey, reader.result as string).catch(() => {});
                  }
                };
                reader.readAsDataURL(blob);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar do cache IndexedDB:", err);
        if (isMounted) setLocalSrc(src);
      });

    return () => {
      isMounted = false;
    };
  }, [src, cacheKey]);

  if (!localSrc) return null;
  return <img src={localSrc} className={className} alt={alt} referrerPolicy={referrerPolicy} {...props} />;
});

export default CachedImage;
