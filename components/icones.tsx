/**
 * Ícones monolinha, desenhados à mão num grid de 24.
 *
 * Existem para os dados deixarem de ser só texto: uma linha "Peso 475 g" com um
 * ícone de balança se lê de relance; sem ele, o card vira lista. Traço em
 * `currentColor` para herdarem a cor do contexto e funcionarem nos dois temas.
 */
const TRACOS: Record<string, React.ReactNode> = {
  bateria: (
    <>
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <path d="M22 10v4" />
      <path d="M6 10.5v3M9.5 10.5v3M13 10.5v3" />
    </>
  ),
  raio: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  // Grade de departamentos: quatro blocos, não as três linhas do hambúrguer —
  // o que este botão abre é um mapa do catálogo, não um menu de aplicativo.
  grade: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  peso: (
    <>
      <path d="M12 3v3" />
      <path d="M5 8h14l2 12H3L5 8z" />
      <path d="M9 13a3 3 0 0 0 6 0" />
    </>
  ),
  portas: (
    <>
      <rect x="4" y="5" width="16" height="6" rx="1.5" />
      <rect x="4" y="13" width="16" height="6" rx="1.5" />
      <path d="M8 8h.01M8 16h.01" />
    </>
  ),
  regua: (
    <>
      <rect x="2" y="8" width="20" height="8" rx="1.5" />
      <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  display: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  cabo: (
    <>
      <path d="M8 3v6M16 3v6" />
      <path d="M6 9h12v3a6 6 0 0 1-12 0V9z" />
      <path d="M12 18v3" />
    </>
  ),
  fone: (
    <>
      <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
      <rect x="3" y="13" width="4" height="7" rx="1.5" />
      <rect x="17" y="13" width="4" height="7" rx="1.5" />
    </>
  ),
  driver: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  bluetooth: <path d="m7 7 10 10-5 5V2l5 5L7 17" />,
  gota: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  onda: <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />,
  ohm: (
    <>
      <path d="M6 20h4l-1.5-3A6 6 0 1 1 15.5 17L14 20h4" />
    </>
  ),
  lupa: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  comparar: (
    <>
      <path d="M4 7h12M13 4l3 3-3 3" />
      <path d="M20 17H8M11 14l-3 3 3 3" />
    </>
  ),
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12 5 5 9-10" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  fonte: (
    <>
      <path d="M6 3h9l5 5v13H6V3z" />
      <path d="M14 3v6h6M9 13h6M9 17h6" />
    </>
  ),
  controle: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  panela: (
    <>
      <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z" />
      <path d="M2 10h20M8 6c0-1.5 1-2 1-3M12 6c0-1.5 1-2 1-3M16 6c0-1.5 1-2 1-3" />
    </>
  ),
  termometro: (
    <>
      <path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0V4z" />
      <path d="M12 9v6" />
    </>
  ),
  celular: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 2v5M14 2v5M10 17v5M14 17v5M2 10h5M2 14h5M17 10h5M17 14h5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4V8z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  tema: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
};

export type NomeIcone = keyof typeof TRACOS;

export function Icone({
  nome,
  className = "h-4 w-4",
  rotulo,
}: {
  nome: NomeIcone | string;
  className?: string;
  rotulo?: string;
}) {
  const tracos = TRACOS[nome] ?? TRACOS.info;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={rotulo ? undefined : true}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
    >
      {tracos}
    </svg>
  );
}
