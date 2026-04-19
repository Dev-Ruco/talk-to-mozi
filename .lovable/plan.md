# Plano técnico — Actualização do texto do `HeroSearch`

## Objectivo

Actualizar o texto principal do componente `HeroSearch` para reflectir de forma clara que a pesquisa cobre **Moçambique e o mundo**, mantendo toda a estrutura visual, classes e comportamento actuais.

A alteração deve ser **cirúrgica**, limitada ao conteúdo textual do título e subtítulo, com um pequeno cuidado adicional para garantir boa quebra de linha no desktop e boa legibilidade no mobile.

---

## Escopo da alteração

### Incluído

- substituição do texto do título;
- substituição do texto do subtítulo;
- preservação do destaque visual da palavra **Moçambique**;
- controlo da quebra de linha do título no desktop, se necessário.

### Não incluído

- alterações de layout;
- alterações de classes Tailwind;
- alterações de espaçamento;
- alterações do input, botão, placeholder ou chips;
- alterações de lógica ou comportamento do componente.

---

## Componente afectado


| Ficheiro                             | Acção                                                  |
| ------------------------------------ | ------------------------------------------------------ |
| `src/components/news/HeroSearch.tsx` | Editar apenas o conteúdo textual do título e subtítulo |


---

## Alterações a implementar

# 1. Título principal

## Texto final pretendido

**O que aconteceu hoje em Moçambique e no mundo?**

## Implementação recomendada

Manter **Moçambique** dentro do `span` com destaque de cor primária e controlar melhor a quebra de linha para evitar um título demasiado comprido no desktop.

### Estrutura recomendada

```
O que aconteceu hoje em{" "}
<span className="text-primary">Moçambique</span>{" "}
<br className="hidden md:block" />
e no mundo?
```

## Razão técnica

Esta abordagem:

-   
preserva o destaque visual de **Moçambique**;  

-   
melhora a leitura no desktop;  

-   
evita uma quebra desajeitada em 3 linhas;  

-   
mantém boa adaptação ao mobile, porque o `<br>` só aparece em `md+`.  


---

# 2. Subtítulo

## Texto final recomendado

**Receba respostas rápidas com base nas notícias mais recentes, em Moçambique e no mundo.**

## Implementação

Substituir apenas o texto actual do `<p>` do subtítulo, sem mexer em classes.

## Razão

Embora a formulação “a nível global” esteja correcta, “no mundo” é:

-   
mais natural;  

-   
mais directa;  

-   
mais coerente com o título;  

-   
melhor para leitura rápida.  


---

## O que deve ser preservado

### No título

-   
classes existentes;  

-   
hierarquia tipográfica;  

-   
alinhamento central;  

-   
largura máxima actual.  


### No subtítulo

-   
classes existentes;  

-   
cor de apoio (`text-muted-foreground`);  

-   
largura máxima;  

-   
espaçamento actual.  


### No restante componente

Não alterar:

-   
badge “Pesquisa IA”;  

-   
input;  

-   
botão;  

-   
chips;  

-   
placeholders;  

-   
espaçamentos gerais;  

-   
paddings da secção.  


---

## Requisitos de implementação

### Título

Manter as classes actuais do `<h1>`, por exemplo:

- `font-display`  

- `text-3xl`  

- `font-bold`  

- `leading-tight`  

- `md:text-5xl`  


### Subtítulo

Manter as classes actuais do `<p>`, por exemplo:

- `text-base`  

- `text-muted-foreground`  

- `md:text-lg`  

- `max-w-*`  

- `mx-auto`  


### Destaque

A palavra **Moçambique** deve continuar destacada com:

```
<span className="text-primary">Moçambique</span>
```

---

## Critérios de aceitação

A alteração será considerada correcta quando:

-   
o título passar a ser:  
  
**O que aconteceu hoje em Moçambique e no mundo?**  

-   
o subtítulo passar a ser:  
  
**Receba respostas rápidas com base nas notícias mais recentes, em Moçambique e no mundo.**  

-   
a palavra **Moçambique** continuar destacada a roxo;  

-   
o título mantiver boa leitura em desktop;  

-   
o título mantiver boa leitura em mobile;  

-   
não houver alterações visuais inesperadas no layout do hero;  

-   
nenhuma outra parte do componente for modificada.  


---

## Ordem de execução

### Passo 1

Abrir `src/components/news/HeroSearch.tsx`.

### Passo 2

Localizar o `<h1>` do hero e substituir o texto actual pela nova versão, mantendo o `span` de destaque.

### Passo 3

Adicionar quebra de linha condicional no desktop com:

```
<br className="hidden md:block" />
```

caso o título esteja demasiado extenso numa única linha ou parta mal.

### Passo 4

Localizar o `<p>` do subtítulo e substituir o texto actual.

### Passo 5

Validar visualmente:

-   
mobile;  

-   
tablet;  

-   
desktop.  


---

## Validação visual recomendada

### Desktop

Confirmar que o título:

-   
fica equilibrado em 2 linhas;  

-   
não parece demasiado comprimido;  

-   
mantém bom impacto visual.  


### Mobile

Confirmar que:

-   
o título quebra naturalmente;  

-   
o subtítulo continua legível;  

-   
não há overflow nem desalinhamento.  


---

## Versão final resumida para execução

```
Actualizar apenas o texto do HeroSearch em src/components/news/HeroSearch.tsx.

Título:
O que aconteceu hoje em Moçambique e no mundo?

Implementação recomendada:
- manter “Moçambique” dentro de <span className="text-primary">
- usar quebra de linha condicional em desktop com <br className="hidden md:block" />

Subtítulo:
Receba respostas rápidas com base nas notícias mais recentes, em Moçambique e no mundo.

Não alterar classes, layout, espaçamentos, input, botão, chips ou qualquer outra parte do componente.
```

## Recomendação final

Este é o plano que eu considero melhor porque:

-   
mantém a alteração simples;  

-   
evita regressões;  

-   
melhora a legibilidade do novo título;  

-   
preserva a identidade visual existente.  


Se quiseres, a seguir posso também preparar um **plano técnico para actualizar o placeholder e os chips**, para ficarem alinhados com “Moçambique e no mundo”.