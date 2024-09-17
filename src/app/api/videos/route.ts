import { NextResponse,NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()


export async function GET(request:NextRequest){
    try {
        const video  = await prisma.video.findMany({
            orderBy : {createdAt : "desc"}
        })

        return NextResponse.json(video)
    } catch (error) {
        console.log("Error int fetching the video",error)
        NextResponse.json(
            {
                error : "Error in fetching the video"
            },{
                status : 404
            }
        )
    }finally{
        await prisma.$disconnect()
    }
}