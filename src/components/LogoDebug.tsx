import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Briefcase } from 'lucide-react';

const LogoDebug: React.FC = () => {
  const [buckets, setBuckets] = useState<string[]>([]);
  const [files, setFiles] = useState<{bucket: string, files: string[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuckets() {
      try {
        // List all buckets
        const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          throw bucketsError;
        }
        
        if (bucketsData) {
          const bucketNames = bucketsData.map(bucket => bucket.name);
          setBuckets(bucketNames);
          
          // For each bucket, list files
          const filesPromises = bucketNames.map(async (bucketName) => {
            const { data: filesData, error: filesError } = await supabase.storage
              .from(bucketName)
              .list();
              
            if (filesError) {
              console.error(`Error listing files in bucket ${bucketName}:`, filesError);
              return { bucket: bucketName, files: [] };
            }
            
            return { 
              bucket: bucketName, 
              files: filesData ? filesData.map(file => file.name) : [] 
            };
          });
          
          const filesResults = await Promise.all(filesPromises);
          setFiles(filesResults);
        }
      } catch (err: any) {
        console.error('Error fetching storage info:', err);
        setError(err.message || 'Failed to fetch storage information');
      } finally {
        setLoading(false);
      }
    }

    fetchBuckets();
  }, []);

  if (loading) {
    return <div>Loading storage information...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Storage Debug</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Available Buckets:</h3>
        {buckets.length === 0 ? (
          <p className="text-gray-500">No buckets found</p>
        ) : (
          <ul className="list-disc pl-5">
            {buckets.map(bucket => (
              <li key={bucket}>{bucket}</li>
            ))}
          </ul>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold">Files in Buckets:</h3>
        {files.length === 0 ? (
          <p className="text-gray-500">No files found</p>
        ) : (
          <div className="space-y-4">
            {files.map(({ bucket, files }) => (
              <div key={bucket} className="border p-3 rounded">
                <h4 className="font-medium">{bucket}:</h4>
                {files.length === 0 ? (
                  <p className="text-gray-500 text-sm">No files in this bucket</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {files.map(file => (
                      <li key={file}>
                        {file}
                        <button 
                          className="ml-2 text-blue-500 text-xs"
                          onClick={() => {
                            const url = supabase.storage.from(bucket).getPublicUrl(file).data.publicUrl;
                            console.log(`Public URL for ${file}:`, url);
                            window.open(url, '_blank');
                          }}
                        >
                          View
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoDebug;