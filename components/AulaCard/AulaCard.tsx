type AulaCardProps = {
  disciplina: string;
  tipo: string;  // "T" ou "P"
  docente: string;
  sala: string;
  dia_semana: number;
  hora_inicio: string;
  duracao: number;
};

function diaSemanaTexto(dia: number) {
  const dias = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ];
  return dias[dia - 1] || "Dia inválido";
}

function tipoTexto(tipo: string) {
  return tipo === "T" ? "Teórica" : tipo === "P" ? "Prática" : tipo;
}

export default function AulaCard({
  disciplina,
  tipo,
  docente,
  sala,
  dia_semana,
  hora_inicio,
  duracao,
}: AulaCardProps) {
  return (
    <div className="border rounded p-4 shadow-sm hover:shadow-md transition mb-4">
      <p>
        <strong>{disciplina}</strong> | {tipoTexto(tipo)} | {docente} | Sala: {sala} |{" "}
        {diaSemanaTexto(dia_semana)} | Início: {hora_inicio} | Duração: {duracao}h
      </p>
    </div>
  );
}
