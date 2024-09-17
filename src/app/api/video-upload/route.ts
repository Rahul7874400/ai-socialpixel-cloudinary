import { v2 as cloudinary } from 'cloudinary';
import { NextRequest,NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECERT
});

interface cloudinaryUploadResult {
    public_id : string,
    bytes : number,
    duration? : number,
    [key : string] : any,
}

export async function POST(request:NextRequest){
    
    try {

        const {userId} = auth()

        if(!userId){
        return NextResponse.json({error : "Unauthorized User"},{status : 404})
        }

        if(!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY ||!process.env.CLOUDINARY_API_SECERT){
            return NextResponse.json({Error : "Cloudinary Credintial not fount"},{status:404})
        }

        // I grab form data and from form data pickup a file and convert in array buffer and use it.

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const title = formData.get("title") as string
        const descripton = formData.get("description") as string
        const originalSize = formData.get("originalSize") as string

        if(!file){
            return NextResponse.json({Error:"file not found"},{status:404})
        }

        const byte = file.arrayBuffer()
        const buffer = Buffer.from("byte") 

        const result = await new Promise<cloudinaryUploadResult>(
            (resolve,reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type :"auto",
                        folder : "video-social-pixel",
                        transformation : [
                            {quality : "auto"},{fetch_format:"mp4"}
                        ]
                    },
                    (error,result)=>{
                        if(error) reject(error)
                        else resolve(result as cloudinaryUploadResult)
                    }

                )

                uploadStream.end(buffer)
            }
        )

        const video = await prisma.video.create({
            data : {
                title,
                descripton,
                publicId : result.public_id,
                orginalSize : originalSize,
                compressedSize : String(result.bytes),
                duration : result.duration || 0
            }
        })

        return NextResponse.json(video)
        
    } catch (error) {
        console.log("Error in uploading the video",error)

        return NextResponse.json({error:"Error in uploading the video"},{status:404})
    }finally{
        prisma.$disconnect()
    }
}