<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Update User Profile Details (Name, Email, Contact).
     */
    public function updateProfile(Request $request)
    {
        try {
            /** @var \App\Models\User $user */ 
            $user = Auth::user();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            // 1. Validation
            $validator = Validator::make($request->all(), [
                'first_name'  => 'sometimes|required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'middle_name' => 'nullable|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'last_name'   => 'sometimes|required|string|max:255|regex:/^[\p{L}\s\'-]+$/u',
                'contact_num' => 'nullable|string|regex:/^[0-9]{10,15}$/',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->user_id, 'user_id')->where(function ($query) {
                        return $query->whereNull('deleted_at');
                    }),
                ],
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
            }

            // 2. Database Transaction
            DB::transaction(function () use ($request, $user) {
                
                // A. Update Base User Table (Using Eloquent instead of DB::table)
                if ($request->has('email')) {
                    $user->email = $request->email;
                    $user->save(); // This updates updated_at automatically
                }

                // B. Update Role Specific Profile
                $profile = null;
                
                if ($user->role === 'Tenant') { // Check casing matches your ENUM (Tenant vs tenant)
                    $profile = $user->tenant; 
                } elseif ($user->role === 'Landlord') {
                    $profile = $user->landlord;
                } elseif ($user->role === 'Admin') {
                     $profile = $user->admin; // Assuming you have an Admin relationship
                }

                // Handle lowercase roles if your DB uses lowercase
                if (!$profile && ($user->role === 'tenant' || $user->role === 'landlord')) {
                     $profile = $user->role === 'tenant' ? $user->tenant : $user->landlord;
                }

                if ($profile) {
                    $profile->update($request->only([
                        'first_name', 
                        'middle_name', 
                        'last_name', 
                        'contact_num'
                    ]));
                }
            });

            // 3. Refresh data to return the latest info
            // Since we added the /** @var */ above, this line is now valid in your IDE
            $user->refresh();
            
            // Load the profile relationship to return complete data
            $user->load(['tenant', 'landlord', 'admin']); 

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully!',
                'data'    => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Update failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Password.
     */
    public function updatePassword(Request $request)
    {
        try {
            /** @var \App\Models\User $user */ // Good practice to add it here too
            $user = Auth::user();
            
            // 1. Validate
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'password'         => 'required|string|min:8|confirmed|different:current_password',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
            }

            // 2. Check Current Password
            if (!Hash::check($request->current_password, $user->password_hash)) {
                return response()->json([
                    'success' => false, 
                    'message' => 'The provided current password does not match our records.'
                ], 400);
            }

            // 3. Update Password
            $user->password_hash = Hash::make($request->password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Password update failed', 'error' => $e->getMessage()], 500);
        }
    }
}