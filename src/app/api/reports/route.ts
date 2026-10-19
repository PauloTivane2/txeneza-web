// src/app/api/reports/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generatePDFReport } from "@/features/reports/services/pdf-generator";
import { generateExcelReport } from "@/features/reports/services/excel-generator";
import { generateCSV } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/core/supabase-admin";
import { findClosestBairro } from "@/core/geo/beira-bairros";
import { ReportFilters, ExportHistoryItem } from "@/features/reports/types";

// Bucket público no Supabase Storage onde os relatórios gerados e o
// índice de histórico (_history.json) são persistidos. Necessário porque
// o sistema de ficheiros da app em produção (Vercel) é só de leitura —
// escrever em public/ funciona em localhost mas falha silenciosamente
// em runtime serverless.
const REPORTS_BUCKET = "relatorios";
const HISTORY_KEY = "_history.json";
const MAX_HISTORY_ITEMS = 15;

/**
 * Lê o índice de histórico (_history.json) do Supabase Storage.
 * Devolve lista vazia se ainda não existir (primeira utilização).
 */
async function readHistory(): Promise<ExportHistoryItem[]> {
  const { data, error } = await supabaseAdmin.storage.from(REPORTS_BUCKET).download(HISTORY_KEY);
  if (error || !data) return [];
  try {
    const text = await data.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Grava o índice de histórico atualizado no Supabase Storage.
 */
async function writeHistory(history: ExportHistoryItem[]): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(REPORTS_BUCKET).upload(
    HISTORY_KEY,
    new Blob([JSON.stringify(history, null, 2)], { type: "application/json" }),
    { contentType: "application/json", upsert: true }
  );
  if (error) {
    throw new Error("Falha ao guardar histórico no Supabase Storage: " + error.message);
  }
}

/**
 * Obtém as ocorrências da base de dados reais com seus relacionamentos mapeados
 */
async function getDatabaseOccurrences() {
  try {
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

    return databaseOccurrences.map((o) => {
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
        reportedBy: o.utilizador?.nome || "Utilizador anónimo",
        reporterBairro: o.utilizador?.bairro || "Não informado",
        imageUrl,
        gravidade: o.gravidade,
      };
    });
  } catch (err) {
    console.error("Erro ao obter ocorrências do banco:", err);
    return [];
  }
}

/**
 * Obtém os pontos de recolha reais da base de dados.
 * Sem fallback simulado: se a BD estiver vazia ou a query falhar,
 * devolve lista vazia — os relatórios não devem apresentar dados fictícios.
 */
async function getCollectionPoints() {
  try {
    const databasePoints = await prisma.pontoRecolha.findMany({
      orderBy: { nome: "asc" },
    });
    return databasePoints.map((p) => ({
      id: p.id_ponto,
      nome: p.nome,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      bairro: p.bairro,
      horario: p.horario,
      estado: p.estado,
    }));
  } catch (err) {
    console.error("Falha ao ler pontos de recolha do DB:", err);
    return [];
  }
}

/**
 * Filtra as ocorrências com base nos filtros fornecidos
 */
function filterOccurrences(items: any[], filters: ReportFilters) {
  return items.filter((item) => {
    if (filters.startDate) {
      if (new Date(item.createdAt) < new Date(filters.startDate)) return false;
    }
    if (filters.endDate) {
      const endLimit = new Date(filters.endDate);
      endLimit.setHours(23, 59, 59, 999);
      if (new Date(item.createdAt) > endLimit) return false;
    }
    if (filters.bairro && filters.bairro !== "todos" && filters.bairro !== "Todas" && filters.bairro !== "Todos") {
      if (item.bairro?.toLowerCase() !== filters.bairro.toLowerCase()) return false;
    }
    if (filters.status && filters.status !== "todas" && filters.status !== "todos") {
      if (item.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
    }
    if (filters.gravity && filters.gravity !== "todas" && filters.gravity !== "todos") {
      const g = item.gravidade || item.gravity || "";
      if (g.toLowerCase() !== filters.gravity.toLowerCase()) return false;
    }
    return true;
  });
}

/**
 * Filtra os pontos de recolha com base nos filtros fornecidos
 */
function filterCollectionPoints(items: any[], filters: ReportFilters) {
  return items.filter((item) => {
    if (filters.bairro && filters.bairro !== "todos" && filters.bairro !== "Todas" && filters.bairro !== "Todos") {
      if (item.bairro?.toLowerCase() !== filters.bairro.toLowerCase()) return false;
    }
    if (filters.status && filters.status !== "todos" && filters.status !== "todas") {
      const statusQuery = filters.status === "ativo" || filters.status === "activo" ? "activo" : "inactivo";
      if (item.estado?.toLowerCase() !== statusQuery) return false;
    }
    return true;
  });
}

import { verifyAdminSession, unauthorizedResponse } from "@/core/server-auth";

/**
 * Endpoint GET: Devolve a lista histórica de relatórios gerados
 */
export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return unauthorizedResponse("Acesso negado: apenas administradores têm acesso aos relatórios.");
  }

  try {
    const history = await readHistory();
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao ler histórico: " + error.message }, { status: 500 });
  }
}

/**
 * Endpoint POST: Gera um novo relatório no servidor
 */
export async function POST(request: NextRequest) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return unauthorizedResponse("Acesso negado: apenas administradores podem gerar relatórios.");
  }

  try {
    const body = await request.json();
    const { type, format, filters = {} } = body as {
      type: "occurrences" | "collection-points" | "summary" | "heatmap";
      format: "pdf" | "excel" | "csv";
      filters: ReportFilters & { ids?: string[] };
    };

    if (!type || !format) {
      return NextResponse.json({ error: "Parâmetros 'type' e 'format' são obrigatórios." }, { status: 400 });
    }

    // 1. Obter e filtrar dados
    let filteredData: any[] = [];
    let stats: any = {};

    if (type === "occurrences" || type === "summary") {
      const allOccurrences = await getDatabaseOccurrences();
      filteredData = filterOccurrences(allOccurrences, filters);
      
      const targetIds = filters.ids;
      if (targetIds && Array.isArray(targetIds)) {
        filteredData = filteredData.filter(o => targetIds.includes(o.id));
      }

      // Calcular estatísticas para relatórios consolidados
      const total = filteredData.length;
      const pendentes = filteredData.filter(o => o.status === "pendente").length;
      const emProgresso = filteredData.filter(o => o.status === "em-progresso" || o.status === "em_analise").length;
      const resolvidos = filteredData.filter(o => o.status === "resolvido" || o.status === "resolvida").length;

      // Distribuição de gravidade
      const gravityDistribution = {
        critica: filteredData.filter(o => o.gravidade === "critica").length,
        alta: filteredData.filter(o => o.gravidade === "alta").length,
        media: filteredData.filter(o => o.gravidade === "media").length,
        baixa: filteredData.filter(o => o.gravidade === "baixa").length,
      };

      // Distribuição de categorias
      const categoriesMap: Record<string, number> = {};
      filteredData.forEach((o) => {
        const cat = o.category || "Outros";
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
      });
      const categoryDistribution = Object.entries(categoriesMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      stats = {
        total,
        pendentes,
        emProgresso,
        resolvidos,
        gravityDistribution,
        categoryDistribution,
        occurrencesList: filteredData
      };
    } else if (type === "collection-points") {
      const allPoints = await getCollectionPoints();
      filteredData = filterCollectionPoints(allPoints, filters);
      
      const targetIds = filters.ids;
      if (targetIds && Array.isArray(targetIds)) {
        filteredData = filteredData.filter(p => targetIds.includes(p.id));
      }
    } else if (type === "heatmap") {
      const allOccurrences = await getDatabaseOccurrences();
      const filteredOccs = filterOccurrences(allOccurrences, filters);
      
      const bairrosMap = new Map<string, number>();
      let totalPoints = 0;
      filteredOccs.forEach((o) => {
        if (o.status === "pendente" || o.status === "em-progresso") {
          totalPoints++;
          const bairro = o.bairro || "Outros";
          bairrosMap.set(bairro, (bairrosMap.get(bairro) || 0) + 1);
        }
      });

      const bairrosDensity = Array.from(bairrosMap.entries()).map(([name, count]) => ({
        bairro: name,
        count: count,
        weight: count
      })).sort((a, b) => b.count - a.count);

      const criticalZone = bairrosDensity[0]?.bairro || "Nenhum";
      const bairrosCount = bairrosDensity.length;

      stats = {
        totalPoints,
        bairrosCount,
        criticalZone,
        bairrosDensity
      };
      filteredData = bairrosDensity;
    }

    // 2. Gerar o Buffer do ficheiro
    let fileBuffer: Buffer;
    let extension = "";
    let mimeType = "";

    if (format === "pdf") {
      fileBuffer = await generatePDFReport(type, filteredData, filters, stats);
      extension = "pdf";
      mimeType = "application/pdf";
    } else if (format === "excel") {
      fileBuffer = await generateExcelReport(type, filteredData, filters, stats);
      extension = "xlsx";
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (format === "csv") {
      // Gerar CSV plano simples
      let csvContent = "";
      if (type === "occurrences" || type === "summary") {
        const rows = filteredData.map((o) => ({
          ID: o.id,
          Titulo: o.title,
          Categoria: o.category,
          Bairro: o.bairro || "",
          Latitude: o.latitude,
          Longitude: o.longitude,
          Gravidade: o.gravidade || "baixa",
          Estado: o.status,
          CriadoEm: o.createdAt,
        }));
        csvContent = generateCSV(rows);
      } else if (type === "collection-points") {
        const rows = filteredData.map((p) => ({
          ID: p.id,
          Nome: p.nome,
          Bairro: p.bairro,
          Latitude: p.latitude,
          Longitude: p.longitude,
          Horario: p.horario || "",
          Estado: p.estado,
        }));
        csvContent = generateCSV(rows);
      } else if (type === "heatmap") {
        const rows = filteredData.map((b) => ({
          Bairro: b.bairro,
          FocosAmostrados: b.count,
          PesoDensidade: b.weight,
        }));
        csvContent = generateCSV(rows);
      }
      fileBuffer = Buffer.from(csvContent, "utf8");
      extension = "csv";
      mimeType = "text/csv";
    } else {
      return NextResponse.json({ error: "Formato de arquivo não suportado." }, { status: 400 });
    }

    // 3. Guardar o ficheiro no Supabase Storage (bucket público "relatorios")
    const dateStamp = new Date().toISOString().replace(/-/g, "").replace(/:/g, "").replace(/T/g, "").slice(0, 14);
    const filename = `relatorio_${type}_${dateStamp}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(REPORTS_BUCKET)
      .upload(filename, fileBuffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      throw new Error("Falha ao guardar o relatório no Supabase Storage: " + uploadError.message);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(REPORTS_BUCKET).getPublicUrl(filename);

    // 4. Registar no histórico (também persistido no Supabase Storage)
    const historyList = await readHistory();

    const newHistoryItem: ExportHistoryItem = {
      id: `exp-${Date.now()}`,
      filename,
      type,
      format,
      createdAt: new Date().toISOString(),
      sizeBytes: fileBuffer.length,
      url: publicUrlData.publicUrl,
      filters,
    };

    historyList.unshift(newHistoryItem);
    // Limitar histórico recente a MAX_HISTORY_ITEMS para não acumular ficheiros indefinidamente
    if (historyList.length > MAX_HISTORY_ITEMS) {
      const removedItems = historyList.splice(MAX_HISTORY_ITEMS);
      const removedFilenames = removedItems.map((item) => item.filename);
      if (removedFilenames.length > 0) {
        const { error: removeError } = await supabaseAdmin.storage.from(REPORTS_BUCKET).remove(removedFilenames);
        if (removeError) {
          console.warn("Falha ao remover relatórios antigos do Storage:", removeError.message);
        }
      }
    }

    await writeHistory(historyList);

    return NextResponse.json(newHistoryItem);
  } catch (error: any) {
    console.error("Erro na geração de relatório:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao gerar relatório: " + error.message },
      { status: 500 }
    );
  }
}
