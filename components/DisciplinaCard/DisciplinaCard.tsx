type Docente = {
  nome: string;
  horas_teoricas: number;
  horas_praticas: number;
};

type Disciplina = {
  id: number;
  nome: string;
  semestre: number;
  horas_teoricas: number;
  horas_praticas: number;
  docentes: Docente[];
};

export default function DisciplinaCard({ disciplina }: { disciplina: Disciplina }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-gray-50">
      <h3 className="text-lg font-bold">{disciplina.nome}</h3>

      <p className="text-sm text-gray-600">
        {disciplina.horas_teoricas > 0 && (
          <span className="font-semibold">
            Teórica: {disciplina.horas_teoricas}h
          </span>
        )}
        {disciplina.horas_teoricas > 0 && disciplina.horas_praticas > 0 && ", "}
        {disciplina.horas_praticas > 0 && (
          <span className="font-semibold">
            Prática: {disciplina.horas_praticas}h
          </span>
        )}
      </p>

      <ul className="list-disc pl-6 mt-2">
        {disciplina.docentes.map((docente, idx) => {
          const partes: string[] = [];
          if (docente.horas_teoricas > 0) partes.push(`teórica: ${docente.horas_teoricas}h`);
          if (docente.horas_praticas > 0) partes.push(`prática: ${docente.horas_praticas}h`);

          return (
            <li key={idx} className="text-gray-700">
              <span className="font-medium">{docente.nome}</span>
              {partes.length > 0 && ` — ${partes.join(" | ")}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
