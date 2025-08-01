"use client";
import { useState, useEffect } from "react";
import SelectFromAPI from "@/components/SelectFromAPI/SelectFromAPI";
import DisciplinaCard from "@/components/DisciplinaCard/DisciplinaCard";
import AulaCard from "@/components/AulaCard/AulaCard"; 

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

type Aula = {
  id: number;
  disciplina_id: number;
  docente_id: number;
  sala_id: number;
  tipo: string; // "T" ou "P"
  sala: string;
  turma: number;
  dia_semana: number;
  hora_inicio: string;
  duracao: number;
  cor: string;
  disciplina: string;
  docente: string;
};

interface Option {
  id: number;
  label: string;
  raw: {
    id: number;
    curso: {
      nome: string;
      sigla: string;
    };
    ano: number;
    semestre: number;
    ano_lectivo: { ano_lectivo: string };
  };
}

export default function Page() {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState<boolean>(false);

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedOption) {
      setDisciplinas([]);
      return;
    }

    const fetchDisciplinas = async () => {
      setLoadingDisciplinas(true);
      try {
        const response = await fetch(
          `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${selectedOption.id}/disciplinas`
        );
        if (!response.ok) throw new Error("Erro ao carregar disciplinas");
        const data: Disciplina[] = await response.json();

        const sortedData = data.map((disciplina) => ({
          ...disciplina,
          docentes: [...disciplina.docentes].sort((a, b) => {
            if (a.horas_teoricas > 0 && b.horas_teoricas === 0) return -1;
            if (a.horas_teoricas === 0 && b.horas_teoricas > 0) return 1;
            return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
          }),
        }));

        setDisciplinas(sortedData);
      } catch (error) {
        console.error(error);
        setDisciplinas([]);
      } finally {
        setLoadingDisciplinas(false);
      }
    };

    fetchDisciplinas();
  }, [selectedOption]);


  useEffect(() => {
    if (!selectedOption) {
      setAulas([]);
      return;
    }

    const fetchAulas = async () => {
      setLoadingAulas(true);
      try {
        const response = await fetch(
          `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${selectedOption.id}/aulas`
        );
        if (!response.ok) throw new Error("Erro ao carregar aulas");
        const data: Aula[] = await response.json();
        setAulas(data);
      } catch (error) {
        console.error(error);
        setAulas([]);
      } finally {
        setLoadingAulas(false);
      }
    };

    fetchAulas();
  }, [selectedOption]);


  return (
    <div className="p-4">
      <h2 className="text-xl mb-2 flex row gap-3 items-center">
        <div className="font-bold">Horário:</div>
        <SelectFromAPI
          endpoint="https://dsdeisi.pythonanywhere.com/api/horarios/horarios"
          onSelect={(option) => setSelectedOption(option)}
        />
      </h2>

      {selectedOption && (
        <>
          <p className="mt-4">
            <strong>{selectedOption.label}</strong>
          </p>
          <p className="text-gray-400">
            <strong>{disciplinas.length} turmas</strong>
          </p>
        </>
      )}

      <section>
        <h3 className="mt-4 mb-2 text-lg font-semibold">Disciplinas</h3>

        {loadingDisciplinas && <p className="text-gray-500">A carregar disciplinas...</p>}

        {!loadingDisciplinas && disciplinas.length > 0 && (
          <div className="space-y-4">
            {disciplinas.map((disciplina) => (
              <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
            ))}
          </div>
        )}

        {!loadingDisciplinas && selectedOption && disciplinas.length === 0 && (
          <p className="text-gray-500">Nenhuma disciplina encontrada.</p>
        )}
      </section>

      <section>
        <h3 className="mt-8 mb-2 text-lg font-semibold">Aulas</h3>

        {loadingAulas && <p className="text-gray-500">A carregar aulas...</p>}

        {!loadingAulas && aulas.length > 0 && (
          <div className="space-y-4">
            {aulas.map((aula) => (
              <AulaCard
                key={aula.id}
                disciplina={aula.disciplina}
                tipo={aula.tipo}
                docente={aula.docente}
                sala={aula.sala}
                dia_semana={aula.dia_semana}
                hora_inicio={aula.hora_inicio}
                duracao={aula.duracao}
              />
            ))}
          </div>
        )}

        {!loadingAulas && selectedOption && aulas.length === 0 && (
          <p className="text-gray-500">Nenhuma aula encontrada.</p>
        )}
      </section>

    </div>
  );
}
