/** Edite e-mails e nomes conforme a sua empresa */
export const AREA_MANAGERS = [
  { id: "fin", name: "Gestor Financeiro", email: "gestor.financeiro@empresa.com.br" },
  { id: "rh", name: "Gestor de RH", email: "gestor.rh@empresa.com.br" },
  { id: "com", name: "Gestor Comercial", email: "gestor.comercial@empresa.com.br" },
  { id: "ops", name: "Gestor de Operações", email: "gestor.operacoes@empresa.com.br" },
];

export const TECHNICIANS = [
  { key: "KAIQUE_OLIVEIRA", label: "Kaique Oliveira" },
  { key: "FERNANDO_FERNANDES", label: "Fernando Fernandes" },
  { key: "RODRIGO_CARMO", label: "Rodrigo Carmo" },
  { key: "ALEXANDRE", label: "Alexandre" },
];

export function technicianLabel(key) {
  return TECHNICIANS.find((t) => t.key === key)?.label || key || "—";
}
