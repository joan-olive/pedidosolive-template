import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const user = locals.user;

        if (!user) {
            return new Response("No autenticado", { status: 401 });
        }

        const formData = await request.formData();

        const currentPassword = formData.get("current_password")?.toString();
        const newPassword = formData.get("new_password")?.toString();
        const newPasswordConfirmation = formData
            .get("new_password_confirmation")
            ?.toString();

        if (!currentPassword || !newPassword || !newPasswordConfirmation) {
            return new Response("Datos obligatorios faltantes", { status: 400 });
        }

        if (newPassword !== newPasswordConfirmation) {
            return new Response("Las contraseñas nuevas no coinciden", {
                status: 400,
            });
        }

        if (!passwordRegex.test(newPassword)) {
            return new Response(
                "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial",
                { status: 400 },
            );
        }

        /** Cliente Supabase NORMAL (no admin) */
        const supabase = createClient(
            import.meta.env.SUPABASE_URL,
            import.meta.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Cookie: request.headers.get("cookie") ?? "",
                    },
                },
            },
        );

        /** 1️⃣ Verificar contraseña actual */
        const { error: signInError } =
            await supabase.auth.signInWithPassword({
                email: user.email!,
                password: currentPassword,
            });

        if (signInError) {
            return new Response("La contraseña actual es incorrecta", {
                status: 400,
            });
        }

        /** 2️⃣ Cambiar contraseña */
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error(updateError);
            return new Response("Error actualizando contraseña", {
                status: 500,
            });
        }

        return new Response(null, { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response("Error interno", { status: 500 });
    }
};
