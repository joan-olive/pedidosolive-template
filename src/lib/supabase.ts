import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient(Astro: any) {
    return createServerClient(
        import.meta.env.SUPABASE_URL,
        import.meta.env.SUPABASE_ANON_KEY,
        {
            cookies: {
                get: (key) => Astro.cookies.get(key)?.value,
                set: (key, value, options) =>
                    Astro.cookies.set(key, value, options),
                remove: (key, options) =>
                    Astro.cookies.delete(key, options),
            },
        }
    );
}
