import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';
import { DISCIPLINAS_CURRICULARES as DISCIPLINAS_AUXILIAR } from './disciplinasFormacaoData';
import { DISCIPLINAS_DIACONO_PRESBITERO as DISCIPLINAS_DIACONO } from './disciplinasDiaconoPresbitero';
import { DISCIPLINAS_PRESBITERO } from './disciplinasPresbitero';
import { DISCIPLINAS_EVANGELISTA_PASTOR } from './disciplinasEvangelistaPastor';

export const TODAS_DISCIPLINAS_CURRICULARES: DisciplinaObreiro[] = [
    ...DISCIPLINAS_AUXILIAR,
    ...DISCIPLINAS_DIACONO,
    ...DISCIPLINAS_PRESBITERO,
    ...DISCIPLINAS_EVANGELISTA_PASTOR
];
