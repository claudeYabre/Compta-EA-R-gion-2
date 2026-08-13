import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Si non connecté, rediriger vers la page de login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Si connecté, récupérer le site attribué à l'utilisateur
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('site_id')
      .eq('id', user.id)
      .single()

    const userSiteId = profile?.site_id

    // Rediriger vers son site s'il essaie d'accéder à la racine ou à un autre site
    const currentPath = request.nextUrl.pathname

    if (userSiteId) {
      const allowedPath = `/sites/${userSiteId}`
      
      if (currentPath === '/' || (currentPath.startsWith('/sites/') && !currentPath.startsWith(allowedPath))) {
        return NextResponse.redirect(new URL(allowedPath, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
