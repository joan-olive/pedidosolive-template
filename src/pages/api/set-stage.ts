import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../lib/supabase";

const STAGES = ["PENDING", "CURRENT", "FINISHED"] as const;
type Stage = (typeof STAGES)[number];

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
        const stage = formData.get("stage")?.toString() as Stage | undefined;

        if (!id) {
            return new Response("ID requerido", { status: 400 });
        }

        if (!stage || !STAGES.includes(stage)) {
            return new Response("Stage no válido", { status: 400 });
        }

        if (stage === "FINISHED") {
            const { error } = await supabase
                .from("orders")
                .update({
                    stage: "FINISHED",
                    is_archieve: true,
                })
                .eq("id", id);

            if (error) {
                return new Response(error.message, { status: 500 });
            }

            return new Response(null, {
                status: 303,
                headers: {
                    Location: "/dashboard",
                },
            });
        }

        const { error } = await supabase
            .from("orders")
            .update({ stage })
            .eq("id", id);

        if (error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response(null, { status: 204 });
    } catch (err: any) {
        return new Response(err?.message ?? "Error interno", { status: 500 });
    }
};
