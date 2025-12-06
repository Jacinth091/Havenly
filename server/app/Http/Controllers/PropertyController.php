<?php

namespace App\Http\Controllers;

use App\Models\Landlord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PropertyController extends Controller{

    public function getOwnedProperties(Request $request){
        try {
            $user = Auth::user();

            if(!$user->landlord){
                return response()->json([
                    'success' => false,
                    'message'=> 'Bad Request, Invalid role detected!'
                ], 403);
            }
            $per_page = $request->input('per_page', 10);
            $per_page = ($per_page > 100) ? 100 :$per_page;

            $properties = $user->landlord->properties()
                ->orderBy('created_at','desc')
                ->paginate($per_page);
                // ->get();
            
           return response()->json([
                'status' => 'success',
                'landlord' => [
                    'name' => $user->landlord->full_name,
                    'id' => $user->landlord->landlord_id
                ],
                'properties' => $properties
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch properties.',
                'error' => $th->getMessage() // Dev only: remove in production
            ], 500);
        }
    }
    
}
