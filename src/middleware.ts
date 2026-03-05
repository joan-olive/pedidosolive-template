import { defineMiddleware } from "astro:middleware";
import { getSupabaseServerClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
	const supabase = getSupabaseServerClient(context);
	const pathname = context.url.pathname;
	const isDashboard = pathname.startsWith("/dashboard");
	const isLogin = pathname.startsWith("/auth/login");
	const isHome = pathname === "/";

	const { data: { user } } = await supabase.auth.getUser();

	if (user && (isLogin || isHome)) {
		return context.redirect("/dashboard");
	}

	if (!user && isDashboard) {
		await supabase.auth.signOut();
		return context.redirect("/auth/login");
	}

	if (user) {
		const { data: profile } = await supabase
			.from("profiles")
			.select("name, surname, second_surname")
			.eq("id", user.id)
			.single();

		context.locals.user = {
			id: user.id,
			email: user.email ?? "",
			name: profile?.name ?? "",
			surname: profile?.surname ?? "",
			second_surname: profile?.second_surname ?? "",
		};
	}

	return next();
});
