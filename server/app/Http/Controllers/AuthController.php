<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;


class AuthController extends Controller
{
    // public function login (Request $request){
    //     $credentials = $request->only('email', 'password');
    //     if(!$token = JWTAuth::attempt($credentials)){
    //         return response()->json(['error' => 'Invalid Credentials'], 401);
    //     }
    //     return $this->respondWithToken($token);
    // }

    public function login(Request $request)
    {
        try {
            $credentials = $request->only('email', 'password');
            // error_log('=== LOGIN ATTEMPT ===');
            // error_log('Credentials: ' . json_encode($credentials));
            // verify user exists and password matches
            // $user = User::where('email', $credentials['email'])->first();
            // FacadesLog::info('User data:', ['user' => $user]);
            $token = JWTAuth::attempt($credentials);

            if(!$token){
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Credentials'
                ],
                401);
            }

            $user = JWTAuth::user();

            // if (!$user || !Hash::check($credentials['password'], $user->password)) {
            //     return response()->json(['success' => false, 'error' => 'Invalid credentials'], 401);
            // }
            
            $ttl = match ($user->role) {
                'admin' => 60 * 24,   // 24 hours
                'landlord' => 60 * 10,    // 10 hours
                'tenant'  => 60 * 5,    // 5 hours
                default => 60 * 2,        // 2 hour fallback
            };

            JWTAuth::factory()->setTTL($ttl);

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => $ttl * 60,
                'user'         => $user,
            ],201);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'errMsg' => $th->getMessage()
            ], 500);
        }
    }
    public function register(Request $request){
        // $validator = Validator::make($request->all(), [
        //     'name' =>'required'
        // ])
    }

    public function logout(){
        JWTAuth::logout();
        return response()->json(['message' => 'Successfully Logged out!']);
    }

    public function me(){
        return response()->json(JWTAuth::user());
    }
    public function verify(Request $request){
        try {
            // $user = JWTAuth::user();
            $user = $request->user();
            error_log("User: " . json_encode($user));
            if(!$user){
                return response()->json([
                    'success' => false,
                    'user'=> null
                ],401);
            }
            return response()->json([
                'success' => true,
                'user' => $user
            ],200);
        } catch (\Exception $e) {
            Log::error("Verify error:", ['error' => $e->getMessage()]);
            error_log("Verify error:", $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error!',
            ], 500);
        }
    }

    private function respondWithToken($token){
        return response()->json([
            'auth_token' => $token,
            'user' => JWTAuth::user(),
        ]);
    }
}
