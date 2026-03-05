import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();

        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString();
        const passwordConfirmation =
            formData.get("password_confirmation")?.toString();
        const name = formData.get("name")?.toString().trim();
        const surname = formData.get("surname")?.toString().trim();
        const secondSurname =
            formData.get("second_surname")?.toString().trim();

        if (!email || !password || !passwordConfirmation || !name || !surname) {
            return new Response("Datos obligatorios faltantes", { status: 400 });
        }

        if (password !== passwordConfirmation) {
            return new Response("Las contraseñas no coinciden", { status: 400 });
        }

        if (!passwordRegex.test(password)) {
            return new Response(
                "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
                { status: 400 }
            );
        }

        const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

        if (authError || !authData.user) {
            console.error(authError);
            return new Response("Error creando usuario", { status: 500 });
        }

        const userId = authData.user.id;

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: userId,
                name,
                surname,
                second_surname: secondSurname || null,
            });

        if (profileError) {
            console.error(profileError);
            return new Response("Error creando perfil", { status: 500 });
        }

        return new Response(null, { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response("Error interno", { status: 500 });
    }
};
