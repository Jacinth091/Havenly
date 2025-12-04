<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {   
        Log::info('JWT ROLE MIDDLEWARE HIT');
        try {
            $user = JWTAuth::parseToken()->authenticate();
            error_log("User: " . json_encode($user));

            if (!$user || $user->deleted_at !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found'
                ], 401);
            }


             if (!empty($roles) && !in_array(strtolower($user->role), $roles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden: Insufficient permissions',
                ], 403);
            }
            error_log("User:" . json_encode($user));
            // JWTAuth::setUser($user);
            // auth()->setUser($user);
            $request->setUserResolver(fn() => $user);

        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Session Expired. Please login again'
            ],401);    
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token'
            ],401);    
        } catch (\Exception $e) {
            Log::error('JWT Middleware Error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Not Authenticated',
                'errMsg' => $e->getMessage(),
            ],401);    
        }
        return $next($request);
    }
}
