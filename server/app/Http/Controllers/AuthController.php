<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Tymon\JWTAuth\Facades\JWTAuth;


class AuthController extends Controller
{
    public function login(Request $request){
        try {
            // error_log("Request: ", json_encode($request));
            $credentials = $request->only('email', 'password');
            $token = JWTAuth::attempt($credentials);

            if(!$token){
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Credentials'
                ],
                401);
            }

            $user = JWTAuth::user();
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
        try {
            error_log("Registration Request: " . json_encode($request->all()));
            
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'middle_name' => 'nullable|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'last_name' => 'required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'username' => [
                    'required',
                    'string',
                    'max:255',
                    'regex:/^[a-zA-Z0-9._-]+$/',
                    Rule::unique('users')->where(function ($query) {
                        return $query->where('is_active', true)
                                    ->whereNull('deleted_at');
                    }),
                ],
                'email' => [
                    'required',
                    'string',
                    'email', // Use built-in email validation instead of regex
                    'max:255',
                    Rule::unique('users')->where(function ($query) {
                        return $query->where('is_active', true)
                                    ->whereNull('deleted_at');
                    }),
                ],
                'password' => 'required|string|min:8|confirmed', // Add 'confirmed' for password_confirmation
                'contact_num' => 'nullable|string|regex:/^[0-9]{10,15}$/', // Fixed: use comma, not hyphen
                'role' => 'required|string|in:tenant,landlord'
            ]);

            if ($validator->fails()) {
                error_log("Validation Errors: " . json_encode($validator->errors()));
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error, Try again!',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = DB::transaction(function () use ($request){
                // Create the user
                $user = User::create([
                    'username' => $request->username,
                    'email' => $request->email,
                    'password_hash' => Hash::make($request->password),
                    'role' => $request->role,
                    'is_active' => true, // Set default active status
                ]);

                if(!$user->user_id){
                    throw new \Exception('User Creation Failed');
                }

                $user_id = $user->user_id;

                if($user->role ==="tenant"){
                    $tenant = Tenant::create([
                        'user_id' => $user_id,
                        'first_name' => $request->first_name,
                        'middle_name' => $request->middle_name,
                        'last_name' => $request->last_name,
                        'contact_num' => $request->contact_num,
                        'is_active' => true, // Set default active status
                    ]);
                }
                else if($user->role == "landlord"){
                    $landlord = Landlord::create([
                        'user_id' => $user_id,
                        'first_name' => $request->first_name,
                        'middle_name' => $request->middle_name,
                        'last_name' => $request->last_name,
                        'contact_num' => $request->contact_num,
                        'is_active' => true, // Set default active status
                    ]);
                }

                // Generate JWT token
                // $token = JWTAuth::fromUser($user);

                return [
                    'user' => $user,
                    // 'token' => $token,
                    'first_name' => $request->first_name,    // Pass these from request
                    'middle_name' => $request->middle_name,  // since they're not in users table
                    'last_name' => $request->last_name,
                    'contact_num' => $request->contact_num,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully!',
                'user' => [
                    'id' => $result['user']->id,
                    'first_name' => $result['first_name'],
                    'middle_name' => $result['middle_name'],
                    'last_name' => $result['last_name'],
                    'username' => $result['user']->username,
                    'email' => $result['user']->email,
                    'contact_num' => $result['contact_num'],
                    'role' => $result['user']->role,
                ],
            ], 201);

        } catch (\Exception $e) {
            error_log("Registration Error: " . $e->getMessage());
            error_log("Stack Trace: " . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
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
            $user = $request->user();
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
