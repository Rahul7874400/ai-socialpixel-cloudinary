import { auth, clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server'
import { redirect } from 'next/dist/server/api-utils'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home"
])

const isPublicRouteApi = createRouteMatcher([
    "/api/video",
])
export default clerkMiddleware((auth,req)=>{
    const {userId} = auth()
    const currentUrl = new URL(req.url)
    const isHomeRequest = currentUrl.pathname === "/home"
    const isApiRequest = currentUrl.pathname.startsWith("/api")


    if(userId && isPublicRoute(req) && !isHomeRequest){
        return NextResponse.redirect(new URL("/home",req.url))
    }

    if(!userId){
        if(!isPublicRoute(req) && !isPublicRouteApi(req)){
            return NextResponse.redirect(new URL("/sign-in",req.url))
        }

        if(isApiRequest && !isPublicRouteApi(req)){
            return NextResponse.redirect(new URL("/sign-in",req.url))
        }
    }

    return NextResponse.next();
})

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}