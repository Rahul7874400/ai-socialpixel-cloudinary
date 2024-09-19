"use client"
import React,{useState,useEffect,useCallback} from 'react'
import VideoCard from '@/app/components/videoCard'
import axios from 'axios'
import { video } from '@prisma/client';


function page() {
  const [videos,setVideos] = useState<video[]>([])
  const [isLoading,setIsLoading] = useState(true)
  const [error,setError] = useState<string | null>(null)
  const fetchVideo = useCallback(async ()=>{
  try {
    const response = await axios.get("/api/videos")
    if(Array.isArray(response.data)){
      setVideos(response.data)
    }else{
      throw new Error("Unexcepted response formate")
    }
  } catch (error) {
    console.log("Error in fetching the video",error)
    setError("Failed in fetching the video")
  }finally{
    setIsLoading(false)
  }
 },[])


 useEffect(()=>{
  fetchVideo()
 },[fetchVideo])


 const handleDownload = useCallback((url:string ,title:string)=>{
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.mp4`
      link.target = "_blank"
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      //window.URL.revokeObjectURL(url);
 },[])

  if(!isLoading){
    return (
      <div> Loading...... </div>
    )
  }
 

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      {videos.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            videos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    onDownload={handleDownload}
                />
            ))
          }
        </div>
      )}
    </div>
  );
}

export default page
