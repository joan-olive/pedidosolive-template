import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../lib/supabase";

const COMPANY_TYPES = ["HIPICA", "GRANJA", "EMPRESA"] as const;
type CompanyType = (typeof COMPANY_TYPES)[number];

const BOX_VOLUMES = [30, 45] as const;
type BoxVolume = (typeof BOX_VOLUMES)[number];

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
        const boxVolumeRaw = formData.get("box_volume")?.toString();
        const companyTypeRaw = formData.get("company_type")?.toString();

        if (!id) {
            return new Response("ID requerido", { status: 400 });
        }

        let box_volume: BoxVolume | null = null;
        let company_type: CompanyType | null = null;

        if (boxVolumeRaw && boxVolumeRaw !== "") {
            const parsed = Number(boxVolumeRaw);
            if (!BOX_VOLUMES.includes(parsed as BoxVolume)) {
                return new Response("box_volume no válido", { status: 400 });
            }
            box_volume = parsed as BoxVolume;
        }

        if (companyTypeRaw && companyTypeRaw !== "") {
            if (!COMPANY_TYPES.includes(companyTypeRaw as CompanyType)) {
                return new Response("company_type no válido", { status: 400 });
            }
            company_type = companyTypeRaw as CompanyType;
        }

        const { error } = await supabase
            .from("orders")
            .update({
                box_volume,
                company_type,
            })
            .eq("id", id);

        if (error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response(null, { status: 204 });
    } catch (err: any) {
        return new Response(err?.message ?? "Error interno", { status: 500 });
    }
};