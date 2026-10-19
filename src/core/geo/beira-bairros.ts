// beira-bairros.ts
// Lista canónica dos 31 bairros oficiais da Cidade da Beira, Moçambique.
// Cada bairro inclui o centro geográfico aproximado [lat, lng] para cálculo
// de georreferenciação espacial e vinculação automática de ocorrências por GPS.

export interface BairroBeira {
  nome: string;
  center: [number, number]; // [lat, lng]
}

export const BAIRROS_BEIRA: BairroBeira[] = [
  { nome: "Alto da Manga", center: [-19.7950, 34.8800] },
  { nome: "Alvalade", center: [-19.8280, 34.8620] },
  { nome: "Central", center: [-19.8350, 34.8390] },
  { nome: "Chaimite", center: [-19.8342, 34.8362] },
  { nome: "Chingussura", center: [-19.7480, 34.8720] },
  { nome: "Chipangara", center: [-19.8322, 34.8445] },
  { nome: "Chota", center: [-19.8200, 34.8250] },
  { nome: "Estoril", center: [-19.8480, 34.8820] },
  { nome: "Esturro", center: [-19.8250, 34.8560] },
  { nome: "Goto", center: [-19.8312, 34.8442] },
  { nome: "Inhamizua", center: [-19.7252, 34.8141] },
  { nome: "Macurungo", center: [-19.8372, 34.8803] },
  { nome: "Macuti", center: [-19.8435, 34.8928] },
  { nome: "Manga", center: [-19.7890, 34.8750] },
  { nome: "Manga Mascarenha", center: [-19.7950, 34.8900] },
  { nome: "Maraza", center: [-19.8080, 34.8685] },
  { nome: "Matacuane", center: [-19.8318, 34.8583] },
  { nome: "Matadouro", center: [-19.8120, 34.8420] },
  { nome: "Matope", center: [-19.7620, 34.8550] },
  { nome: "Muave", center: [-19.7350, 34.8300] },
  { nome: "Mungassa", center: [-19.7780, 34.8950] },
  { nome: "Munhava", center: [-19.8150, 34.8450] },
  { nome: "Ndunda", center: [-19.7520, 34.8380] },
  { nome: "Nhaconjo", center: [-19.7688, 34.8690] },
  { nome: "Nhangau", center: [-19.7050, 34.9150] },
  { nome: "Nhangoma", center: [-19.7400, 34.8900] },
  { nome: "Pioneiros", center: [-19.8260, 34.8480] },
  { nome: "Ponta Gêa", center: [-19.8446, 34.8472] },
  { nome: "Tchondja", center: [-19.7820, 34.8600] },
  { nome: "Vaz Manga", center: [-19.7900, 34.8710] },
  { nome: "Vila Massane", center: [-19.8180, 34.8590] },
];

export const BAIRROS_BEIRA_NOMES: string[] = BAIRROS_BEIRA.map((b) => b.nome);

export function getBairroCenter(nome: string): [number, number] | undefined {
  if (!nome) return undefined;
  const normalized = normalizeBairroName(nome);
  return BAIRROS_BEIRA.find((b) => b.nome.toLowerCase() === normalized.toLowerCase())?.center;
}

/**
 * Normaliza grafias alternativas conhecidas para a forma oficial do catálogo.
 */
export function normalizeBairroName(input: string): string {
  if (!input) return "";
  const trim = input.trim();
  const lower = trim.toLowerCase();

  const ALIASES: Record<string, string> = {
    "munhava central": "Munhava",
    "munhava-central": "Munhava",
    "macúti": "Macuti",
    "ponta-gêa": "Ponta Gêa",
    "ponta gea": "Ponta Gêa",
    "ponta-gea": "Ponta Gêa",
    "inhamízua": "Inhamizua",
    "vaz": "Vaz Manga",
    "manga loforte": "Manga",
    "baixa / mercado": "Central",
    "baixa": "Central",
    "maquinino": "Matacuane",
    "palmeiras": "Ponta Gêa",
    "mananga": "Munhava",
    "nharuchonga": "Nhaconjo",
    "ntopa": "Maraza",
  };

  if (ALIASES[lower]) {
    return ALIASES[lower];
  }

  const directMatch = BAIRROS_BEIRA.find((b) => b.nome.toLowerCase() === lower);
  return directMatch ? directMatch.nome : trim;
}

export const BEIRA_BOUNDING_BOX = {
  minLat: -20.0000,
  maxLat: -19.6500,
  minLng: 34.7500,
  maxLng: 35.0000,
} as const;

export const MAX_BEIRA_TOLERANCE_KM = 15.0;
export const FORA_DA_BEIRA = "Fora da Beira";

export interface BairroResolution {
  nome: string;
  isDentroDaBeira: boolean;
  distanciaCentroKm: number;
}

/**
 * Resolve a integridade espacial de um ponto em relação à Cidade da Beira.
 */
export function resolveBairro(lat: number, lng: number): BairroResolution {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      nome: FORA_DA_BEIRA,
      isDentroDaBeira: false,
      distanciaCentroKm: Infinity,
    };
  }

  const foraBoundingBox =
    lat < BEIRA_BOUNDING_BOX.minLat ||
    lat > BEIRA_BOUNDING_BOX.maxLat ||
    lng < BEIRA_BOUNDING_BOX.minLng ||
    lng > BEIRA_BOUNDING_BOX.maxLng;

  let closestName = "Central";
  let minDistanceKm = Infinity;

  for (const b of BAIRROS_BEIRA) {
    const dLatKm = (lat - b.center[0]) * 110.574;
    const dLngKm = (lng - b.center[1]) * 111.320 * Math.cos((b.center[0] * Math.PI) / 180);
    const distKm = Math.sqrt(dLatKm * dLatKm + dLngKm * dLngKm);

    if (distKm < minDistanceKm) {
      minDistanceKm = distKm;
      closestName = b.nome;
    }
  }

  const isDentro = !foraBoundingBox && minDistanceKm <= MAX_BEIRA_TOLERANCE_KM;

  return {
    nome: isDentro ? closestName : FORA_DA_BEIRA,
    isDentroDaBeira: isDentro,
    distanciaCentroKm: Math.round(minDistanceKm * 10) / 10,
  };
}

/**
 * Verifica rapidamente se uma coordenada GPS pertence ao perímetro municipal da Beira.
 */
export function isCoordenadaNaBeira(lat: number, lng: number): boolean {
  return resolveBairro(lat, lng).isDentroDaBeira;
}

/**
 * Determina o bairro canónico oficial da Beira mais próximo de um par de coordenadas (lat, lng).
 * Se a coordenada estiver fora do perímetro municipal de 15 km, retorna "Fora da Beira".
 */
export function findClosestBairro(lat: number, lng: number): string {
  return resolveBairro(lat, lng).nome;
}