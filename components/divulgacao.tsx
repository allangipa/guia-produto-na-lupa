/** Divulgação de afiliado acima da dobra: exigência da Amazon, do CDC e do bom senso. */
export function Divulgacao({ atualizadoEm }: { atualizadoEm: string }) {
  return (
    <p className="text-[0.85rem] text-tinta-suave">
      Análise independente · Atualizada em {atualizadoEm} · Contém links de
      afiliado
    </p>
  );
}
