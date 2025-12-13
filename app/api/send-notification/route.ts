import { sendNotifications } from "@/lib/fcm-helper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { token, tokens, title, message, link } = await request.json();

    // Suporta tanto single token quanto múltiplos tokens
    const targetTokens = tokens || (token ? [token] : []);

    const result = await sendNotifications(targetTokens, title, message, link);

    if (result.success) {
        return NextResponse.json(result);
    } else {
        if (result.error === "No tokens provided") {
            return NextResponse.json(
                { success: false, error: "No tokens provided" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: false,
            error: result.error,
            successCount: result.successCount,
            failureCount: result.failureCount,
            totalTokens: result.totalTokens,
        }, { status: 500 });
    }
}
