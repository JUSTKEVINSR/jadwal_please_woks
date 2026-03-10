<?php

namespace App\Http\Controllers;

use App\Models\FormSignature;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FormSignatureController extends Controller
{
    public function index()
    {
        $signatures = FormSignature::latest()->get();
        return Inertia::render('SignaturesArciheve/Index', [
            'signatures' => $signatures
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'signature' => 'required|string',
        ]);

        // Generate a unique 4-digit code
        do {
            $code = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (FormSignature::where('code', $code)->exists());

        $formSignature = FormSignature::create([
            'code' => $code,
            'signature' => $request->signature,
        ]);

        return response()->json([
            'message' => 'Signature saved successfully',
            'code' => $formSignature->code,
        ]);
    }

    public function destroy(FormSignature $formSignature)
    {
        $formSignature->delete();
        return redirect()->back()->with('success', 'Signature deleted successfully');
    }
}
