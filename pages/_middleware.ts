import { NextRequest, NextResponse } from 'next/server'
import { setupCache } from '../utils/cacheUtils'

export function middleware(req: NextRequest) {
	// Add the user token to the response
	return setUserCookie(req, NextResponse.next())
}
