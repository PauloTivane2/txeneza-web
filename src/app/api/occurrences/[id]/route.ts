import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarPush } from "@/features/notifications/push.service";
import { verifyAdminSession, unauthorizedResponse } from "@/core/server-auth";

import { findClosestBairro, isCoordenadaNaBeira, FORA_DA_BEIRA } from "@/core/geo/beira-bairros";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function serialize(o: any, isAdmin: boolean) {
  let status: "pendente" | "em-progresso" | "resolvido" | "rejeitado" = "pendente";
  if (o.estado === "em_analise") status = "em-progresso";
  else if (o.estado === "resolvida") status = "resolvido";
  else if (o.estado === "rejeitada") status = "rejeitado";

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
    reportedBy: isAdmin ? (o.utilizador?.nome || "Utilizador anónimo") : undefined,
    reporterBairro: isAdmin ? (o.utilizador?.bairro || "Não informado") : undefined,
    imageUrl,
    gravidade: o.gravidade,
  };
}

/**
 * Obtém uma ocorrência específica por ID.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await verifyAdminSession(request);
    const { id } = await params;
    const o = await prisma.ocorrencia.findUnique({
      where: { id_ocorrencia: id },
      include: {
        utilizador: true,
        categoria: true,
        fotografias: {
          take: 1,
          orderBy: { data_hora: "desc" },
        },
      },
    });

    if (!o) {
      return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
    }

    return NextResponse.json(serialize(o, !!session));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao obter ocorrência: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * Atualiza o estado de uma ocorrência.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return unauthorizedResponse("Acesso negado: apenas administradores podem alterar o estado da ocorrência.");
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status não fornecido." },
        { status: 400 }
      );
    }

    const existing = await prisma.ocorrencia.findUnique({
      where: { id_ocorrencia: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
    }

    const isFora = existing.bairro === FORA_DA_BEIRA || !isCoordenadaNaBeira(Number(existing.latitude), Number(existing.longitude));
    if (isFora) {
      return NextResponse.json(
        { error: "Não é permitido alterar o estado de ocorrências com localização fora do Município da Beira." },
        { status: 403 }
      );
    }

    // Mapeamento para Escrita (Frontend -> DB):
    // - "pendente" -> pendente
    // - "em-progresso" -> em_analise
    // - "resolvido" -> resolvida
    // - "rejeitado" -> rejeitada
    let databaseStatus: "pendente" | "em_analise" | "resolvida" | "rejeitada" = "pendente";
    if (status === "em-progresso") databaseStatus = "em_analise";
    else if (status === "resolvido") databaseStatus = "resolvida";
    else if (status === "rejeitado") databaseStatus = "rejeitada";

    const atualizado = await prisma.ocorrencia.update({
      where: { id_ocorrencia: id },
      data: {
        estado: databaseStatus as any,
        data_hora_sync: new Date(),
      },
      include: {
        utilizador: true,
        categoria: true,
        fotografias: {
          take: 1,
          orderBy: { data_hora: "desc" },
        },
      },
    });

    // REGISTO AUTOMÁTICO DE NOTIFICAÇÃO NA BASE DE DADOS + PUSH FCM
    try {
      const statusLabel =
        status === "em-progresso"
          ? "Em Progresso"
          : status === "resolvido"
          ? "Resolvida"
          : status === "rejeitado"
          ? "Rejeitada"
          : "Pendente";

      const mensagemNotif = `O estado da ocorrência de «${atualizado.categoria.nome}» foi alterado para ${statusLabel}.`;

      await prisma.notificacao.create({
        data: {
          id_utilizador: atualizado.id_utilizador,
          id_ocorrencia: atualizado.id_ocorrencia,
          tipo: "alteracao_estado",
          mensagem: mensagemNotif,
          lida: false,
          data_hora: new Date(),
        },
      });

      // Disparar notificação push FCM
      await enviarPush({
        fcmToken: atualizado.utilizador?.fcm_token,
        tipo: "alteracao_estado",
        mensagem: mensagemNotif,
        idOcorrencia: atualizado.id_ocorrencia,
      });
    } catch (notifErr: any) {
      console.warn("Aviso ao processar notificação/push:", notifErr.message);
    }

    return NextResponse.json(serialize(atualizado, true));
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Erro ao actualizar ocorrência: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * Elimina uma ocorrência e os seus registos associados.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return unauthorizedResponse("Acesso negado: apenas administradores podem eliminar ocorrências.");
  }

  try {
    const { id } = await params;

    const exists = await prisma.ocorrencia.findUnique({
      where: { id_ocorrencia: id },
    });

    if (!exists) {
      return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
    }

    // Apagar dependências em transação
    await prisma.$transaction([
      prisma.verificacaoResolucao.deleteMany({ where: { id_ocorrencia: id } }),
      prisma.notificacao.deleteMany({ where: { id_ocorrencia: id } }),
      prisma.fotografia.deleteMany({ where: { id_ocorrencia: id } }),
      prisma.ocorrencia.delete({ where: { id_ocorrencia: id } }),
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao eliminar ocorrência: " + error.message },
      { status: 500 }
    );
  }
}
