import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const supabase = getSupabaseServerClient({ cookies });

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new Response("No autorizado", { status: 401 });
        }

        const formData = await request.formData();
        const orderId = formData.get("order_id")?.toString();

        if (!orderId) {
            return new Response("ID requerido", { status: 400 });
        }

        const { error } = await supabase
            .from("orders")
            .update({ is_archieve: true })
            .eq("id", orderId);

        if (error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response(null, {
            status: 303,
            headers: {
                Location: "/dashboard",
            },
        });
    } catch (err: any) {
        return new Response(err?.message ?? "Error interno", {
            status: 500,
        });
    }
};
