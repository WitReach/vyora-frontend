import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Thank you for your purchase. We have received your order and are processing it. You will receive an email confirmation shortly.
            </p>
            <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition">
                Continue Shopping
            </Link>
        </div>
    );
}
