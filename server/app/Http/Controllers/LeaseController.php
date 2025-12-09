<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Room;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LeaseController extends Controller
{
    // Lease agreement creation and tracking
    public function store(Request $request)
    {
        // Validate inputs
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,room_id',
            'tenant_id' => 'required|exists:tenants,tenant_id',
            'start_date' => 'required|date|after_or_equal:today', // 
            'end_date' => 'required|date|after:start_date',       // 
            'monthly_rent' => 'required|numeric|min:1',
            'payment_due_day' => 'required|integer|min:1|max:31',
        ]);

        $user = Auth::user();
        $landlord = Landlord::where('user_id', $user->user_id)->first();

        // 1. Verify Property Ownership
        // Ensure the room belongs to a property owned by this landlord
        $room = Room::where('room_id', $validated['room_id'])
                    ->whereHas('property', function($q) use ($landlord) {
                        $q->where('landlord_id', $landlord->landlord_id);
                    })->firstOrFail();

        // 2. Business Rule: Room Availability 
        if ($room->room_status !== 'Available') {
            return response()->json(['error' => 'Room is not available for lease.'], 409);
        }

        // 3. Business Rule: Single Active Lease per Tenant 
        $activeTenantLease = Lease::where('tenant_id', $validated['tenant_id'])
                                  ->where('lease_status', 'Active')
                                  ->exists();
        if ($activeTenantLease) {
            return response()->json(['error' => 'Tenant already has an active lease.'], 409);
        }

        DB::beginTransaction();
        try {
            // Rent Locking: Store rent in lease separate from room's current rent
            $lease = Lease::create([
                'room_id' => $validated['room_id'],
                'tenant_id' => $validated['tenant_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'monthly_rent' => $validated['monthly_rent'], // Historical record
                'payment_due_day' => $validated['payment_due_day'],
                'lease_status' => 'Active',
                'is_active' => true
            ]);

            // Update Room Status to Occupied
            $room->update(['room_status' => 'Occupied']);

            DB::commit();
            return response()->json(['message' => 'Lease created successfully', 'data' => $lease], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create lease'], 500);
        }
    }

    public function terminateLease(Request $request, $lease_id)
    {
        $user = Auth::user();
        $landlord = Landlord::where('user_id', $user->user_id)->first();

        // Find lease belonging to landlord's property
        $lease = Lease::where('lease_id', $lease_id)
                      ->whereHas('room.property', function($q) use ($landlord) {
                          $q->where('landlord_id', $landlord->landlord_id);
                      })->firstOrFail();

        DB::beginTransaction();
        try {
            // Update Lease Status
            $lease->update([
                'lease_status' => 'Terminated',
                'end_date' => Carbon::now(), // End it effective immediately
                'notes' => $request->input('notes', 'Terminated by Landlord')
            ]);

            // Free up the room
            Room::where('room_id', $lease->room_id)->update(['room_status' => 'Available']);

            DB::commit();
            return response()->json(['message' => 'Lease terminated successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to terminate lease'], 500);
        }
    }

    public function getLandlordLeases()
    {
        $landlord = Landlord::where('user_id', Auth::id())->first();

        // Get leases for all rooms in properties owned by this landlord
        $leases = Lease::with(['room.property', 'tenant'])
            ->whereHas('room.property', function($q) use ($landlord) {
                $q->where('landlord_id', $landlord->landlord_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($leases);
    }

    public function createLeaseAndAssignTenantToProperty(Request $request)
    {
        try {
            // 1. AUTHENTICATION
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => "Unauthorized"], 401);

            // 2. VALIDATION
            $validator = Validator::make($request->all(), [
                'property_id' => 'required|integer|exists:properties,property_id',
                'room_id' => 'required|integer|exists:rooms,room_id',
                'tenant_id' => 'required|integer|exists:tenants,tenant_id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'monthly_rent' => 'required|numeric|min:0',
                'security_deposit' => 'nullable|numeric|min:0',
                'payment_due_day' => 'required|integer|between:1,31',
                'transaction.amount' => 'required|numeric|min:0',
                'transaction.payment_method' => 'required|string',
                'transaction.reference_number' => 'nullable|string', // Allow null, handled in logic
                'transaction.payment_for_month' => 'required|date',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
            }

            // 3. DATABASE TRANSACTION
            $result = DB::transaction(function () use ($request, $user) {
                
                // A. VERIFY OWNERSHIP & PROPERTY MATCH
                $room = Room::with('property')->findOrFail($request->room_id);

                if ($room->property_id != $request->property_id) {
                    throw new \Exception("Data Mismatch: Room does not belong to selected property.");
                }
                
                if ($room->room_status !== 'Available') {
                    throw new \Exception("This unit is no longer available.");
                }

                $landlord = Landlord::where('user_id', $user->user_id)->first();
                if (!$landlord || $room->property->landlord_id !== $landlord->landlord_id) {
                    throw new \Exception("Unauthorized: You do not own this property.");
                }

                // B. CREATE LEASE
                $lease = Lease::create([
                    'room_id' => $request->room_id,
                    'tenant_id' => $request->tenant_id,
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'monthly_rent' => $request->monthly_rent,
                    'security_deposit' => $request->security_deposit ?? 0,
                    'payment_due_day' => $request->payment_due_day,
                    'notes' => $request->notes,
                    'lease_status' => 'Active',
                    'is_active' => true
                ]);

                // C. LOGIC: HANDLE REFERENCE NUMBER GENERATION
                $inputRef = $request->input('transaction.reference_number');
                $paymentMethod = $request->input('transaction.payment_method');
                $finalRefNumber = $inputRef;

                // LOGIC: If the frontend sent "SYSTEM_GENERATED" (which usually means Cash),
                // OR if the payment method is explicitly Cash, we auto-generate.
                if ($inputRef === 'SYSTEM_GENERATED' || $paymentMethod === 'Cash') {
                    // Format: PAY-{Year}{Month}{Day}-{RandomString}
                    // Example: PAY-20231209-X8K29A
                    $finalRefNumber = 'PAY-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
                }
                
                // If it was NOT system generated (e.g. GCash Ref "123456789"), 
                // $finalRefNumber stays as "123456789".

                // D. CREATE TRANSACTION
                $transaction = Transaction::create([
                    'lease_id' => $lease->lease_id,
                    'amount' => $request->input('transaction.amount'),
                    'payment_method' => $paymentMethod,
                    'reference_number' => $finalRefNumber, // <--- Used the processed variable
                    'payment_for_month' => $request->input('transaction.payment_for_month'),
                    'transaction_date' => now(),
                    'transaction_status' => 'Completed',
                    'is_active' => true
                ]);

                // E. UPDATE ROOM STATUS
                $room->update(['room_status' => 'Occupied']);

                return ['lease' => $lease, 'transaction' => $transaction];
            });

            return response()->json(['success' => true, 'message' => 'Lease created successfully.', 'data' => $result], 201);

        } catch (\Exception $e) {
             $statusCode = (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), 'Mismatch')) ? 403 : 500;
             return response()->json(['success' => false, 'message' => $e->getMessage()], $statusCode);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => 'Server Error', 'error' => $th->getMessage()], 500);
        }
    }




    

}