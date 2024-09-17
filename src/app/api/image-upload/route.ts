import { v2 as cloudinary } from 'cloudinary';
import { NextRequest,NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECERT
});

interface cloudinaryUploadResult {
    public_id : string,
    [key : string] : any
}

export async function POST(request:NextRequest){
    const {userId} = auth()

    if(!userId){
        return NextResponse.json({error : "Unauthorized User"},{status : 404})
    }

    try {
        // I grab form data and from form data pickup a file and convert in array buffer and use it.

        const formData = await request.formData()
        const file = formData.get("file") as File |null

        if(!file){
            return NextResponse.json({Error:"file not found"},{status:404})
        }

        const byte = file.arrayBuffer()
        const buffer = Buffer.from("byte") 

        const result = await new Promise<cloudinaryUploadResult>(
            (resolve,reject)=>{
                const uploadStream = cloudinary.uploader.upload_stream(
                    {folder : "social-pixel-image"},
                    (error,result)=>{
                        if(error) reject(error)
                        else resolve(result as cloudinaryUploadResult)
                    }

                )

                uploadStream.end(buffer)
            }
        )

        return NextResponse.json({result:result.public_id},{status : 200})
        
    } catch (error) {
        console.log("Error in Posting the image",error)

        return NextResponse.json({error:"Error in Posting the image"},{status:404})
    }
}