import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/core/server-auth";
import { findClosestBairro } from "@/core/geo/beira-bairros";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Obtém todas as ocorrências cadastradas no banco de dados.
 *
 * Nota de privacidade: o nome do cidadão que reportou (reportedBy) e seu
 * bairro de residência (reporterBairro) só são incluídos na resposta quando
 * o pedido vem de uma sessão de administrador autenticada. Para pedidos
 * públicos (ex.: o mapa público /map), estes campos são omitidos.
 */
export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession(request);

    const databaseOccurrences = await prisma.ocorrencia.findMany({
      include: {
        utilizador: true,
        categoria: true,
        fotografias: {
          take: 1,
          orderBy: { data_hora: "desc" },
        },
      },
      orderBy: { data_hora_registo: "desc" },
    });

    // Mapeia do banco de dados para a interface Occurrence do frontend
    const serialized = databaseOccurrences.map((o) => {
      let status: "pendente" | "em-progresso" | "resolvido" | "rejeitado" = "pendente";
      if ((o.estado as string) === "em_analise") status = "em-progresso";
      else if ((o.estado as string) === "resolvida") status = "resolvido";
      else if ((o.estado as string) === "rejeitada") status = "rejeitado";

      const lat = Number(o.latitude);
      const lng = Number(o.longitude);
      const rawBairro = (o as any).bairro as string | undefined;
      const occurrenceBairro = rawBairro && rawBairro.trim() !== "" ? rawBairro : findClosestBairro(lat, lng);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qixdkjsdurbzmpxlimdy.supabase.co";
      const imageUrl = o.fotografias[0]?.caminho_ficheiro
        ? `${supabaseUrl}/storage/v1/object/public/denuncias/${o.fotografias[0].caminho_ficheiro}`
        : undefined;

      const categoryName = o.categoria?.nome || "Resíduo";

      return {
        id: o.id_ocorrencia,
        title: `Ocorrência de ${categoryName}`,
        description: o.descricao || "",
        category: categoryName,
        latitude: lat,
        longitude: lng,
        bairro: occurrenceBairro,
        status,
        createdAt: o.data_hora_registo ? o.data_hora_registo.toISOString() : new Date().toISOString(),
        updatedAt: o.data_hora_sync ? o.data_hora_sync.toISOString() : undefined,
        reportedBy: session ? (o.utilizador?.nome || "Utilizador anónimo") : undefined,
        reporterBairro: session ? (o.utilizador?.bairro || "Não informado") : undefined,
        imageUrl,
        gravidade: o.gravidade,
      };
    });

    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error("Erro em /api/occurrences GET:", error);
    return NextResponse.json(
      { error: "Erro ao carregar ocorrências: " + error.message },
      { status: 500 }
    );
  }
}
