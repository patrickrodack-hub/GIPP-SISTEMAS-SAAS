/**
 * Tipos e Dados Padrão do Repertório Musical e Cifras
 * Ministério de Louvor & Adoração - Portal do Membro GIPP
 */

export interface ArquivoAnexoMusica {
  nome: string;
  url: string;
}

export interface MusicaRepertorio {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  ritmo?: string;
  bpm?: string | number;
  pasta?: string;
  letra_cifra: string;
  arquivos?: ArquivoAnexoMusica[];
  data_cadastro?: string;
  updatedAt?: string;
}

export const PASTAS_REPERTORIO_PADRAO = [
  'Domingo',
  'Santa Ceia',
  'Jovens',
  'Vigília',
  'Casamento',
  'Especial'
];

/**
 * Músicas consagradas de repertório para servir como base rica e inicial
 * caso a igreja ainda esteja cadastrando suas cifras
 */
export const MUSICAS_REPERTORIO_PADRAO: MusicaRepertorio[] = [
  {
    id: 'mus-padrao-1',
    titulo: 'Porque Ele Vive',
    artista: 'Harpa Cristã / Tradicional',
    tom: 'G',
    ritmo: 'Balada / Worship',
    bpm: '68',
    pasta: 'Domingo',
    letra_cifra: `[Intro]
G  C  G  D  G

[Verso 1]
       G           C
Deus enviou Seu Filho amado
         G    Em       Am    D
Para morrer     em meu lugar
           G         C
Na cruz pagou por meus pecados
            G     Em       Am   D      G   C  G
Mas ressurgiu       e vivo com o Pai está

[Refrão]
          G    G7            C
Porque Ele vive,   posso crer no amanhã
           G   Em            Am    D
Porque Ele vive,   temor não há
             G   G7           C
Mas eu bem sei,    eu sei que a minha vida
          G    Em       Am     D     G
Está nas mãos    do meu Jesus, que vivo está

[Verso 2]
         G           C
E quando enfim chegar a hora
            G    Em        Am    D
Em que a morte     enfrentarei
            G          C
Sem medo então, terei vitória
         G   Em          Am    D       G
Verei na glória o meu Jesus, que vivo está`,
    arquivos: []
  },
  {
    id: 'mus-padrao-2',
    titulo: 'Bondade de Deus',
    artista: 'Isaías Saad / Bethel Music',
    tom: 'G',
    ritmo: 'Worship / 6/8',
    bpm: '70',
    pasta: 'Domingo',
    letra_cifra: `[Intro]
G  C  G  C

[Verso 1]
      G                  C
Te amo, Deus, Tua graça nunca falha
    D/F#  Em          C            D
Todos os dias eu estou em Tuas mãos
                Em      C
Desde quando me levanto
            G   D/F#  Em
Até o meu deitar
      C           D             G
Eu cantarei da bondade de Deus

[Refrão]
C                       G
   És fiel em todo tempo
C                           G            D
   Em todo tempo Tu és tão, tão bom
C                          Em     D    C
   Com todo fôlego que há em mim
                  D             G
   Eu cantarei da bondade de Deus

[Verso 2]
      G                      C
Tua voz me guia em meio à tempestade
     D/F#  Em        C              D
Na escuridão Tua presença me sustenta
            Em        C
Te chamo de Pai
             G   D/F#  Em
Te chamo de Amigo
      C          D             G
Eu vivi na bondade de Deus`,
    arquivos: []
  },
  {
    id: 'mus-padrao-3',
    titulo: 'A Ele a Glória',
    artista: 'Diante do Trono',
    tom: 'Am',
    ritmo: 'Adoração',
    bpm: '65',
    pasta: 'Santa Ceia',
    letra_cifra: `[Intro]
Am  G  F  G  Am

[Verso]
         Am               G
Porque d'Ele e por Ele
        F              E
Para Ele são todas as coisas
         Am               G
Porque d'Ele e por Ele
        F              E
Para Ele são todas as coisas

[Refrão]
        Am       G
A Ele a glória,
        F        E
A Ele a glória,
        Am   G          F    E
A Ele a glória, pra sempre amém!

[Ponte]
             Am
Quão insondáveis
             G
São os Teus caminhos
             F
E inescrutáveis
             E
Os Teus juízos`,
    arquivos: []
  },
  {
    id: 'mus-padrao-4',
    titulo: 'Grandes Coisas',
    artista: 'Fernandinho',
    tom: 'D',
    ritmo: 'Jubiloso / Celebrativo',
    bpm: '124',
    pasta: 'Jovens',
    letra_cifra: `[Intro]
D  G  Bm  G

[Verso]
D
Tu és o Deus dessa terra
G
Tu és o Rei desse povo
Bm                         G
És o Senhor dessa nação, Tu és

D
Esperança aos desenganados
G
A luz na escuridão
Bm                            G
És a paz aos desesperados, Tu és

[Refrão]
Bm          A         G
Não há outro Deus como Tu
Bm          A         G
Não há outro Deus como Tu
D
Grandes coisas vão acontecer aqui
A
Grandes coisas vão acontecer aqui
G
Nesta cidade`,
    arquivos: []
  },
  {
    id: 'mus-padrao-5',
    titulo: 'Raridade',
    artista: 'Anderson Freire',
    tom: 'C',
    ritmo: 'Balada Gospel',
    bpm: '72',
    pasta: 'Especial',
    letra_cifra: `[Intro]
C  G/B  Am  F

[Verso 1]
C                             G/B
Não consigo ir além do Teu olhar
                            Am
Tudo o que eu consigo é imaginar
                             F
A riqueza que existe dentro de você
C                                  G/B
O ouro eu consegui e благо compreendi
                                 Am
Que o Teu amor na cruz me fez vencer
                                 F
Você é um espelho que reflete a imagem do Senhor

[Refrão]
         C                     G/B
Você é um espelho que reflete a imagem do Senhor
              Am                        F
Não chore se o mundo ainda não notou
          Dm                     G
Já é o bastante Deus reconhecer o seu valor
        C                G/B
Você é precioso, mais raro que o ouro puro de Ofir
          Am                    F
Se você desistiu, Deus não vai desistir
           Dm                    G           C
Você vale ouro, você é a pérola do Salvador`,
    arquivos: []
  },
  {
    id: 'mus-padrao-6',
    titulo: 'Em Teus Braços',
    artista: 'Laura Souguellis',
    tom: 'E',
    ritmo: 'Intimista / Worship',
    bpm: '64',
    pasta: 'Vigília',
    letra_cifra: `[Intro]
E  B  C#m  A

[Verso]
E                 B
Seguro estou nos braços
            C#m
Daquele que nunca me deixou
       A
Seu amor perfeito sempre esteve aqui
E                  B
E se eu passar pelo vale
       C#m
Acharei conforto em Teu amor
           A
Pois eu sei que és aquele que me guarda

[Refrão]
E
Em Teus braços é meu descanso
B
Em Teus braços é meu descanso
C#m                  A
Em Teus braços é meu descanso`,
    arquivos: []
  }
];

/**
 * Avalia se o usuário logado possui prerrogativas de Músico ou Integrante do Ministério de Louvor
 * Varre com segurança todas as fontes de verdade do banco de dados (membros, louvor_musicos, departamentos, cargos, talentos).
 */
export function checkIsMusicoOuLouvor(user: any, db: any, extraMusicosList?: any[]): boolean {
  if (!user) return false;

  // 1. Administradores Master ou Pastores com acesso integral
  if (user.nivel === 'master' || user.nivel === 'pastor') return true;
  if (Array.isArray(user.permissoes) && (
    user.permissoes.includes('access_ministerio_louvor') || 
    user.permissoes.includes('access_ministerios') ||
    user.permissoes.includes('access_repertorio')
  )) {
    return true;
  }

  const userMember = (db?.membros || []).find((m: any) => m.id === user.id) || user;

  // 2. Integrantes cadastrados na coleção / lista oficial de Músicos de Louvor
  const musicosList = Array.isArray(extraMusicosList) && extraMusicosList.length > 0 
    ? extraMusicosList 
    : (Array.isArray(db?.louvor_musicos) ? db.louvor_musicos : []);

  const inMusicosLouvor = musicosList.some((m: any) => {
    if (!m) return false;
    if (m.membro_id && (m.membro_id === user.id || m.membro_id === userMember.id)) return true;
    if (m.id && (m.id === user.id || m.id === userMember.id)) return true;
    if (m.membro_nome && user.nome && m.membro_nome.toLowerCase().trim() === user.nome.toLowerCase().trim()) return true;
    return false;
  });
  if (inMusicosLouvor) return true;

  // 3. Integrantes do Departamento de Louvor / Música nos departamentos da igreja
  const departamentos = Array.isArray(db?.departamentos) ? db.departamentos : [];
  const inDeptLouvor = departamentos.some((dept: any) => {
    const nomeDept = String(dept.nome || '').toLowerCase();
    const isDeptMusica = /louvor|m[uú]sic|adora[cç][aã]o|levita|banda/i.test(nomeDept);
    if (!isDeptMusica) return false;
    const team = Array.isArray(dept.membros) ? dept.membros : [];
    return team.some((mm: any) => mm.membro_id === user.id || mm.id === user.id);
  });
  if (inDeptLouvor) return true;

  // 4. Função Administrativa do Portal configurada como Músico / Louvor / Canto
  const funcaoAdm = String(userMember.funcao_administrativa || user.funcao_administrativa || '').toUpperCase();
  if (['MUSICO', 'MÚSICO', 'LOUVOR', 'CANTO', 'LEVITA', 'MINISTRO_LOUVOR'].includes(funcaoAdm)) return true;

  // 5. Verificação textual em Cargo, Função, Talentos e Departamento
  const matchMusicoTerm = (str: any) => {
    if (!str) return false;
    const s = String(str).toLowerCase();
    return /m[uú]sic|louvor|cantor|cantora|vocal|levita|instrument|viol[aã]|guitar|tecl|bater|baix|sax|coral/i.test(s);
  };

  if (matchMusicoTerm(userMember.cargo) || matchMusicoTerm(user.cargo)) return true;
  if (matchMusicoTerm(userMember.funcao) || matchMusicoTerm(user.funcao)) return true;
  if (matchMusicoTerm(userMember.departamento) || matchMusicoTerm(user.departamento)) return true;
  if (matchMusicoTerm(userMember.ministerio) || matchMusicoTerm(user.ministerio)) return true;

  // Talentos cadastrados na ficha do membro
  if (Array.isArray(userMember.talentos) && userMember.talentos.some((t: any) => matchMusicoTerm(t))) return true;
  if (typeof userMember.talentos === 'string' && matchMusicoTerm(userMember.talentos)) return true;

  return false;
}
