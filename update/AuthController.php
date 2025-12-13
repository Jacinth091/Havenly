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
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;


class AuthController extends Controller
{
    public function login(Request $request){
        try {
            $credentials = $request->only('email', 'password');
            
            // Attempt authentication
            $token = JWTAuth::attempt($credentials);

            if(!$token){
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Credentials'
                ],
                401);
            }

            $user = JWTAuth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found after authentication'
                ], 401);
            }

            // Normalize role to lowercase for matching (database stores capitalized)
            $role = strtolower($user->role);
            $ttl = match ($role) {
                'admin' => 60 * 24,   // 24 hours
                'landlord' => 60 * 10,    // 10 hours
                'tenant'  => 60 * 5,    // 5 hours
                default => 60 * 2,          // 2 hour fallback
            };

            JWTAuth::factory()->setTTL($ttl);

            $token = JWTAuth::fromUser($user);

            // Return only essential user fields to avoid triggering slow accessors
            // Accessors like profile_complete, has_profile, etc. make database queries
            $userData = [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ];

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'token_type'   => 'bearer',
                'expires_in'   => $ttl * 60,
                'user'         => $userData,
            ],201);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token expired',
                'errMsg' => $e->getMessage()
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
                'errMsg' => $e->getMessage()
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'JWT Error',
                'errMsg' => $e->getMessage()
            ], 500);
        } catch (\Throwable $th) {
            Log::error('Login Error', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error',
                'errMsg' => config('app.debug') ? $th->getMessage() : 'An error occurred during login'
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
                    'email', 
                    'max:255',
                    Rule::unique('users')->where(function ($query) {
                        return $query->where('is_active', true)
                                     ->whereNull('deleted_at');
                    }),
                ],
                'password' => 'required|string|min:8|confirmed', // Add 'confirmed' for password_confirmation
                'contact_num' => 'nullable|string|regex:/^[0-9]{10,15}$/', // Optional but recommended
                'role' => 'required|string|in:tenant,landlord'
            ]);

            if ($validator->fails()) {
                error_log("Validation Errors: " . json_encode($validator->errors()));
                return response()->json([
                    'success' => false,
                    'message' => $validator->errors()|| 'Validation Error, Try again!',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = DB::transaction(function () use ($request){
                // Normalize role to match database enum (capitalized)
                $role = ucfirst(strtolower($request->role));
                
                // Create the user
                $user = User::create([
                    'username' => $request->username,
                    'email' => $request->email,
                    'password_hash' => Hash::make($request->password),
                    'role' => $role,
                    'is_active' => true, // Set default active status
                ]);

                if(!$user->user_id){
                    throw new \Exception('User Creation Failed');
                }

                $user_id = $user->user_id;

                if(strtolower($user->role) === "tenant"){
                    // Ensure contact_num has a value since DB doesn't allow null
                    $contactNum = $request->contact_num ? trim($request->contact_num) : '00000000000';
                    
                    $tenant = Tenant::create([
                        'user_id' => $user_id,
                        'first_name' => trim($request->first_name),
                        'middle_name' => $request->middle_name ? trim($request->middle_name) : null,
                        'last_name' => trim($request->last_name),
                        'contact_num' => $contactNum,
                        'is_active' => true, // Set default active status
                    ]);
                }
                else if(strtolower($user->role) === "landlord"){
                    // Ensure contact_num has a value since DB doesn't allow null
                    $contactNum = $request->contact_num ? trim($request->contact_num) : '00000000000';
                    
                    $landlord = Landlord::create([
                        'user_id' => $user_id,
                        'first_name' => trim($request->first_name),
                        'middle_name' => $request->middle_name ? trim($request->middle_name) : null,
                        'last_name' => trim($request->last_name),
                        'contact_num' => $contactNum,
                        'is_active' => true, // Set default active status
                    ]);
                }

                // Generate JWT token
                // $token = JWTAuth::fromUser($user);

                return [
                    'user' => $user,
                    // 'token' => $token,
                    'first_name' => $request->first_name,    
                    'middle_name' => $request->middle_name, 
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

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            JWTAuth::parseToken()->invalidate();

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out!'
            ]);

        } catch (TokenExpiredException $e) {
            // Token is expired, but we still treat it as a successful logout
            return response()->json([
                'success' => true,
                'message' => 'Token was already expired, successfully logged out.'
            ]);
        } catch (TokenInvalidException $e) {
            // Token is invalid, but we still treat it as a successful logout
             return response()->json([
                'success' => true,
                'message' => 'Token was already invalid, successfully logged out.'
            ]);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not log out: ' . $e->getMessage()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout due to an internal error.',
                'error' => $e->getMessage()
            ], 500);
        }
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