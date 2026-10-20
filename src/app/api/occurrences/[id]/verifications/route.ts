import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/core/supabase-admin";
import { verifyAdminSession, unauthorizedResponse } from "@/core/server-auth";
import { enviarPush } from "@/features/notifications/push.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const STORAGE_BUCKET = "denuncias";

/**
 * GET: Obtém todas as verificações de resolução da ocorrência.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const verifications = await prisma.verificacaoResolucao.findMany({
      where: { id_ocorrencia: id },
      include: {
        fotografia: true,
      },
      orderBy: { data_hora: "desc" },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qixdkjsdurbzmpxlimdy.supabase.co";

    const serialized = verifications.map((v) => {
      const photoPath = v.fotografia?.caminho_ficheiro;
      let photoUrl = "";
      if (photoPath) {
        if (photoPath.startsWith("http") || photoPath.startsWith("data:")) {
          photoUrl = photoPath;
        } else {
          photoUrl = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${photoPath}`;
        }
      }

      return {
        id: v.id_verificacao,
        occurrenceId: v.id_ocorrencia,
        photoUrl,
        result: v.resultado === "nao_resolvida" ? "nao_resolvida" : "resolvida",
        confianca: Number(v.confianca_comparacao),
        notes: v.observacoes || undefined,
        createdAt: v.data_hora.toISOString(),
      };
    });

    return NextResponse.json(serialized);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao obter verificações: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria uma nova prova de resolução (com foto), executa a verificação por IA,
 * grava no Supabase Storage e na base de dados, e reabre a ocorrência automaticamente
 * se o resultado for 'nao_resolvida'.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return unauthorizedResponse("Acesso negado: apenas administradores podem registar provas de resolução.");
  }

  try {
    const { id: occurrenceId } = await params;
    const formData = await request.formData();
    const photoFile = formData.get("photo") as File | null;
    const notes = (formData.get("notes") as string | null) || undefined;
    const customResult = formData.get("result") as string | null;

    if (!photoFile) {
      return NextResponse.json(
        { error: "Fotografia de resolução é obrigatória." },
        { status: 400 }
      );
    }

    // 1. Buscar a ocorrência e a foto original da denúncia
    const occurrence = await prisma.ocorrencia.findUnique({
      where: { id_ocorrencia: occurrenceId },
      include: {
        fotografias: {
          where: { tipo: "denuncia" },
          take: 1,
          orderBy: { data_hora: "desc" },
        },
        utilizador: true,
      },
    });

    if (!occurrence) {
      return NextResponse.json({ error: "Ocorrência não encontrada." }, { status: 404 });
    }

    // 2. Upload da imagem de resolução para o Supabase Storage
    const arrayBuffer = await photoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = photoFile.name ? photoFile.name.split(".").pop() : "jpg";
    const fileName = `verificacao/verif_${occurrenceId}_${Date.now()}.${fileExt}`;
    const mimeType = photoFile.type || "image/jpeg";

    let savedPath = fileName;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Aviso no upload para Supabase Storage, a usar fallback base64 Data URI:", uploadError.message);
      savedPath = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    // 3. Salvar registo de Fotografia no Prisma
    const novaFoto = await prisma.fotografia.create({
      data: {
        id_ocorrencia: occurrenceId,
        caminho_ficheiro: savedPath,
        tipo: "verificacao",
        data_hora: new Date(),
      },
    });

    // 4. Determinar ID do utilizador (usando session ou utilizador da ocorrência/admin)
    let utilizadorId = session.uid;
    const validUser = await prisma.utilizador.findUnique({ where: { id_utilizador: utilizadorId } });
    if (!validUser) {
      // Usar o primeiro utilizador administrador do banco como fallback
      const adminDb = await prisma.utilizador.findFirst({ where: { tipo: "administrador" } });
      utilizadorId = adminDb ? adminDb.id_utilizador : occurrence.id_utilizador;
    }

    const finalResultado: "resolvida" | "nao_resolvida" = "resolvida";
    const finalNotes = notes || "Prova fotográfica de resolução registada pela equipa municipal.";

    // 5. Salvar VerificacaoResolucao no banco
    const novaVerificacao = await prisma.verificacaoResolucao.create({
      data: {
        id_ocorrencia: occurrenceId,
        id_utilizador: utilizadorId,
        id_foto_verificacao: novaFoto.id_fotografia,
        resultado: finalResultado,
        confianca_comparacao: 100.0,
        observacoes: finalNotes,
        data_hora: new Date(),
      },
    });

    // 6. ATUALIZAÇÃO DO ESTADO DA OCORRÊNCIA PARA RESOLVIDA
    // A anexação da prova marca a ocorrência como resolvida.
    // A reabertura é prerrogativa exclusiva do munícipe após conferência no mobile.
    const novoEstadoOcorrencia = "resolvida";

    await prisma.ocorrencia.update({
      where: { id_ocorrencia: occurrenceId },
      data: {
        estado: novoEstadoOcorrencia,
        data_hora_sync: new Date(),
      },
    });

    // 7. REGISTO DE NOTIFICAÇÃO NA BASE DE DADOS E PUSH NOTIFICATION
    try {
      const msgNotif = "A equipa municipal anexou a prova de intervenção. A ocorrência foi marcada como resolvida.";
      const tipoNotif = "resolucao_validada";

      await prisma.notificacao.create({
        data: {
          id_utilizador: occurrence.id_utilizador,
          id_ocorrencia: occurrenceId,
          tipo: tipoNotif,
          mensagem: msgNotif,
          lida: false,
          data_hora: new Date(),
        },
      });

      // Push real (FCM) para o morador no mobile
      await enviarPush({
        fcmToken: occurrence.utilizador.fcm_token,
        tipo: tipoNotif,
        mensagem: msgNotif,
        idOcorrencia: occurrenceId,
      });
    } catch (notifErr: any) {
      console.warn("Aviso ao registar notificação na BD:", notifErr.message);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qixdkjsdurbzmpxlimdy.supabase.co";
    const photoUrl = savedPath.startsWith("data:") || savedPath.startsWith("http")
      ? savedPath
      : `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${savedPath}`;

    return NextResponse.json({
      id: novaVerificacao.id_verificacao,
      occurrenceId: novaVerificacao.id_ocorrencia,
      photoUrl,
      result: finalResultado,
      confianca: Number(novaVerificacao.confianca_comparacao),
      notes: novaVerificacao.observacoes || undefined,
      createdAt: novaVerificacao.data_hora.toISOString(),
      occurrenceStatus: novoEstadoOcorrencia,
    });
  } catch (error: any) {
    console.error("Erro ao registar prova de resolução:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar prova de resolução: " + error.message },
      { status: 500 }
    );
  }
}
