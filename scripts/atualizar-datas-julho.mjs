import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do txeneza-web/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qixdkjsdurbzmpxlimdy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_JpOo5wAButzC9RMoj7WASQ_Q0wRVNkN';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Erro: Variáveis do Supabase ausentes no ficheiro .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

function transformarParaJulho(dataOriginalStr) {
  if (!dataOriginalStr) return null;
  const dataOriginal = new Date(dataOriginalStr);
  const novaData = new Date(dataOriginal.getTime());
  
  // Mudar o mês para Julho (índice 6 em JavaScript: 0 = Janeiro, 6 = Julho, 9 = Outubro)
  novaData.setUTCMonth(6);
  return novaData.toISOString();
}

async function executar() {
  console.log('====================================================');
  console.log('PESQUISA E ATUALIZAÇÃO DE DATAS DE OCORRÊNCIAS');
  console.log('Origem: Outubro -> Destino: Julho');
  console.log('====================================================');

  // 1. Obter todas as ocorrências
  const { data: ocorrencias, error } = await supabase
    .from('ocorrencia')
    .select('id_ocorrencia, bairro, descricao, data_hora_registo, data_hora_sync, estado')
    .order('data_hora_registo', { ascending: false });

  if (error) {
    console.error('Erro ao consultar tabela ocorrencia:', error);
    process.exit(1);
  }

  console.log(`Total de ocorrências registadas no sistema: ${ocorrencias.length}`);

  // 2. Filtrar ocorrências de Outubro (mês 10 / índice UTC 9)
  const ocorrenciasOutubro = ocorrencias.filter((o) => {
    if (!o.data_hora_registo) return false;
    const d = new Date(o.data_hora_registo);
    return d.getUTCMonth() === 9; // Outubro
  });

  console.log(`Ocorrências identificadas no mês de Outubro: ${ocorrenciasOutubro.length}\n`);

  if (ocorrenciasOutubro.length === 0) {
    console.log('Nenhuma ocorrência encontrada com data em Outubro.');
    return;
  }

  let totalAtualizadas = 0;

  for (const o of ocorrenciasOutubro) {
    const dataAntiga = o.data_hora_registo;
    const novaDataRegisto = transformarParaJulho(dataAntiga);
    const novaDataSync = transformarParaJulho(o.data_hora_sync) || novaDataRegisto;

    console.log(`[Ocorrência] ${o.id_ocorrencia}`);
    console.log(`  - Bairro: ${o.bairro || 'Sem bairro'}`);
    console.log(`  - Data original (Outubro): ${dataAntiga}`);
    console.log(`  - Nova data (Julho):       ${novaDataRegisto}`);

    // Atualizar tabela ocorrencia
    const { error: erroOcorrencia } = await supabase
      .from('ocorrencia')
      .update({
        data_hora_registo: novaDataRegisto,
        data_hora_sync: novaDataSync,
      })
      .eq('id_ocorrencia', o.id_ocorrencia);

    if (erroOcorrencia) {
      console.error(`  -> Erro ao atualizar ocorrência ${o.id_ocorrencia}:`, erroOcorrencia.message);
      continue;
    }

    // Atualizar fotografias associadas
    const { data: fotos, error: erroBuscaFotos } = await supabase
      .from('fotografia')
      .select('id_fotografia, data_hora')
      .eq('id_ocorrencia', o.id_ocorrencia);

    if (!erroBuscaFotos && fotos && fotos.length > 0) {
      for (const foto of fotos) {
        const novaDataFoto = transformarParaJulho(foto.data_hora) || novaDataRegisto;
        await supabase
          .from('fotografia')
          .update({ data_hora: novaDataFoto })
          .eq('id_fotografia', foto.id_fotografia);
      }
      console.log(`  -> ${fotos.length} fotografia(s) sincronizada(s) para Julho.`);
    }

    totalAtualizadas++;
    console.log('  -> Estado: Atualizada com sucesso.\n');
  }

  console.log('====================================================');
  console.log(`PROCESSO CONCLUÍDO: ${totalAtualizadas} ocorrência(s) atualizada(s) para Julho.`);
  console.log('====================================================');
}

executar().catch((err) => {
  console.error('Falha fatal na execução do script:', err);
  process.exit(1);
});
