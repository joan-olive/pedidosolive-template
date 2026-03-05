import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { getSupabaseServerClient } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
    // 1️⃣ verificar usuario autenticado
    const supabase = getSupabaseServerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response("No autorizado", { status: 401 });
    }

    // (opcional) comprobar rol admin en profiles
    // const { data: profile } = await supabase
    //   .from("profiles")
    //   .select("role")
    //   .eq("id", user.id)
    //   .single();
    //
    // if (profile?.role !== "admin") ...

    // 2️⃣ obtener ID a borrar
    const formData = await request.formData();
    const id = formData.get("id")?.toString();

    if (!id) {
        return new Response("ID requerido", { status: 400 });
    }

    // 3️⃣ borrar en AUTH
    const { error: authError } =
        await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
        console.error(authError);
        return new Response("Error borrando usuario auth", { status: 500 });
    }

    // 4️⃣ borrar perfil (opcional)
    await supabaseAdmin.from("profiles").delete().eq("id", id);

    return new Response(null, { status: 200 });
};
