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
        const id = formData.get("id")?.toString();

        if (!id) {
            return new Response("ID requerido", { status: 400 });
        }

        const { error } = await supabase
            .from("orders")
            .delete()
            .eq("id", id);

        if (error) {
            return new Response("Error eliminando pedido", { status: 500 });
        }

        return Response.redirect(
            new URL("/dashboard/archivo-pedidos", request.url),
            303
        );    
    } catch {
        return new Response("Error interno", { status: 500 });
    }
};
