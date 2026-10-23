# ig/ — agenda do Instagram (@guiaprodutonalupa)

Única parte do repositório que o Instagram escreve. As mídias de cada post ficam em
`public/ig/<pasta>/` (servidas em https://guiaprodutonalupa.com.br/ig/<pasta>/): carrossel
em `01.jpg`…`NN.jpg`, Reel em `reel.mp4` + `capa.jpg`, e `legenda.txt` nos dois.

`agenda.json` lista os posts. A rotina na nuvem "Guia Produto na Lupa: publicar no
Instagram" roda todo dia às 12h e às 19h de Brasília, publica pelo Composio (conta
`instagram_acne-capote`) o item de hoje com `estado: pronto` cuja hora já chegou, marca
`publicado` com o permalink e faz push. Para cancelar um post: `estado: cancelado`.
