import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Briefcase } from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLogoUrl() {
      try {
        // Direct URL approach since we know the exact URL
        const directUrl = "https://fooriwwekswfmyjkbtbj.supabase.co/storage/v1/object/public/Imagens//logo.jpg";
        
        // Test if the URL is valid by preloading the image
        const img = new Image();
        img.onload = () => {
          setLogoUrl(directUrl);
          setLoading(false);
        };
        img.onerror = () => {
          console.error('Could not load image from direct URL:', directUrl);
          // Fallback to using the Supabase API
          fallbackToSupabaseApi();
        };
        img.src = directUrl;
      } catch (error) {
        console.error('Error setting logo URL:', error);
        fallbackToSupabaseApi();
      }
    }

    async function fallbackToSupabaseApi() {
      try {
        // Try with Supabase API
        const { data } = supabase.storage
          .from('Imagens')
          .getPublicUrl('logo.jpg');
        
        if (data && data.publicUrl) {
          const img = new Image();
          img.onload = () => {
            setLogoUrl(data.publicUrl);
            setLoading(false);
          };
          img.onerror = () => {
            console.error('Could not load image from Supabase URL:', data.publicUrl);
            setError(true);
            setLoading(false);
          };
          img.src = data.publicUrl;
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in Supabase fallback:', error);
        setError(true);
        setLoading(false);
      }
    }

    fetchLogoUrl();
  }, []);

  if (loading) {
    return <div className={`h-10 w-10 ${className}`} />;
  }

  if (error || !logoUrl) {
    return <Briefcase className={`h-10 w-10 text-blue-700 ${className}`} />;
  }

  return (
    <img 
      src={logoUrl} 
      alt="Work4All Logo" 
      className={`h-10 ${className}`}
      onError={() => {
        console.error('Failed to load logo');
        setError(true);
      }}
    />
  );
};

export default Logo;