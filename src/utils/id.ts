export function gerarId() {
  // Bom o suficiente para uso local (localStorage), sem dependências externas.
  return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random()}`
}

