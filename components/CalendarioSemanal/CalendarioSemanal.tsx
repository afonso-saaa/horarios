'use client';

import { useState, useEffect } from 'react';
import styles from './CalendarioSemanal.module.css';

type ClassType = {
  id: number;
  name: string;
};

interface Disciplina {
  id: number;
  nome: string;
  docentes: {
    id: number;
    nome: string;
    horas_teoricas: number;
    horas_praticas: number;
  }[];
}

interface AulaIn {
  horario_id: number;
  disciplina_id: number;
  docente_id: number;
  sala_id?: number;
  tipo: string;
  sala: string;
  turma: number;
  dia_semana: number;
  hora_inicio: string; // Formato "HH:MM"
  duracao: number;
  cor: string;
}

interface Slot extends AulaIn {
  id: number;
  disciplina_nome: string;
  docente_nome: string;
}

interface SlotForm {
  id: number | null;
  dia_semana: string;
  turma: string;
  hora_inicio: string;
  duracao: string;
  disciplina_id: string;
  docente_id: string;
  sala: string;
  color: string;
  type: string;
  disciplina_nome: string;
  docente_nome: string;
}

const WeeklyCalendar = ({ horario_id }: { horario_id: number }) => {
  const [classCount, setClassCount] = useState(3);
  const [classPrefix, setClassPrefix] = useState("Turma");
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<SlotForm>({
    id: null,
    dia_semana: '1',
    turma: '1',
    hora_inicio: '08:00',
    duracao: '60',
    disciplina_id: '',
    docente_id: '',
    sala: '',
    color: '#3a87ad',
    type: 'T',
    disciplina_nome: '',
    docente_nome: ''
  });

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [docentesDisciplina, setDocentesDisciplina] = useState<Disciplina['docentes']>([]);
  const [loading, setLoading] = useState({
    disciplinas: false,
    aulas: false,
    saving: false
  });
  const [error, setError] = useState<string | null>(null);

  const HOUR_HEIGHT = 60;
  const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const CALENDAR_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

  const DAYS = [
    { id: 1, name: 'Segunda' },
    { id: 2, name: 'Terça' },
    { id: 3, name: 'Quarta' },
    { id: 4, name: 'Quinta' },
    { id: 5, name: 'Sexta' }
  ];

  // Buscar disciplinas e aulas ao carregar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, disciplinas: true, aulas: true }));
        
        // Buscar disciplinas
        const disciplinasResponse = await fetch(
          `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}/disciplinas`
        );
        const disciplinasData = await disciplinasResponse.json();
        setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
        
        // Buscar aulas existentes (você precisará implementar este endpoint)
        const aulasResponse = await fetch(
          `https://dsdeisi.pythonanywhere.com/api/horarios/horarios/${horario_id}/aulas`
        );
        const aulasData = await aulasResponse.json();
        setSlots(Array.isArray(aulasData) ? aulasData.map(convertAulaToSlot) : []);
        
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(prev => ({ ...prev, disciplinas: false, aulas: false }));
      }
    };

    fetchData();
  }, [horario_id]);

  // Inicializa as turmas
  useEffect(() => {
    const newClasses = [];
    for (let i = 1; i <= classCount; i++) {
      newClasses.push({ id: i, name: `${classPrefix} ${i}` });
    }
    setClasses(newClasses);
  }, [classCount, classPrefix]);

  // Converter aula da API para Slot
  const convertAulaToSlot = (aula: any): Slot => {
    const disciplina = disciplinas.find(d => d.id === aula.disciplina_id);
    const docente = disciplina?.docentes.find(d => d.id === aula.docente_id);
    
    return {
      id: aula.id,
      horario_id: aula.horario_id,
      disciplina_id: aula.disciplina_id,
      docente_id: aula.docente_id,
      sala_id: aula.sala_id,
      tipo: aula.tipo,
      sala: aula.sala,
      turma: aula.turma,
      dia_semana: aula.dia_semana,
      hora_inicio: aula.hora_inicio,
      duracao: aula.duracao,
      cor: aula.cor,
      disciplina_nome: disciplina?.nome || '',
      docente_nome: docente?.nome || ''
    };
  };

  // Atualizar lista de docentes quando a disciplina mudar
  useEffect(() => {
    if (currentSlot.disciplina_id) {
      const disciplinaSelecionada = disciplinas.find(
        d => d.id === parseInt(currentSlot.disciplina_id)
      );
      if (disciplinaSelecionada) {
        setDocentesDisciplina(disciplinaSelecionada.docentes);
        setCurrentSlot(prev => ({
          ...prev,
          docente_id: '',
          docente_nome: '',
          type: 'T'
        }));
      }
    } else {
      setDocentesDisciplina([]);
    }
  }, [currentSlot.disciplina_id, disciplinas]);

  const calculateSlotPosition = (startTime: string): number => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours - START_HOUR) * 60 + minutes;
    return totalMinutes * MINUTE_HEIGHT;
  };

  const renderSlotsForDayAndClass = (dayId: number, classId: number) => {
    if (loading.aulas) return <div>Carregando aulas...</div>;
    
    return slots
      .filter(slot => slot.dia_semana === dayId && slot.turma === classId)
      .map(slot => {
        const top = calculateSlotPosition(slot.hora_inicio);
        const height = slot.duracao * MINUTE_HEIGHT;
        
        return (
          <div
            key={`slot-${slot.id}`}
            className={styles.slot}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              backgroundColor: slot.cor
            }}
            onClick={(e) => {
              e.stopPropagation();
              openEditSlotModal(slot);
            }}
          >
            <div className={styles.slotTitle}>{slot.disciplina_nome}</div>
            <div className={styles.slotDetails}>{slot.docente_nome} - {slot.sala}</div>
            <div className={styles.slotDetails}>
              <em>{slot.tipo === 'T' ? 'Teórica' : 'Prática'}</em>
            </div>
          </div>
        );
      });
  };

  const generateTimeMarkers = () => {
    const markers = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      markers.push(
        <div 
          key={`full-${hour}`}
          className={styles.timeMarker}
          style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
        >
          {`${hour.toString().padStart(2, '0')}:00`}
        </div>
      );
      
      if (hour < END_HOUR) {
        markers.push(
          <div 
            key={`half-${hour}`}
            className={`${styles.timeMarker} ${styles.halfHour}`}
            style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT + (HOUR_HEIGHT / 2)}px` }}
          >
            {`${hour.toString().padStart(2, '0')}:30`}
          </div>
        );
      }
    }
    return markers;
  };

  const openNewSlotModal = (day: number, classId: number, startTime?: string) => {
    setCurrentSlot({
      id: null,
      dia_semana: day.toString(),
      turma: classId.toString(),
      hora_inicio: startTime || '08:00',
      duracao: '60',
      disciplina_id: '',
      docente_id: '',
      sala: '',
      color: '#3a87ad',
      type: 'T',
      disciplina_nome: '',
      docente_nome: ''
    });
    setModalOpen(true);
  };

  const openEditSlotModal = (slot: Slot): void => {
    setCurrentSlot({
      id: slot.id,
      dia_semana: slot.dia_semana.toString(),
      turma: slot.turma.toString(),
      hora_inicio: slot.hora_inicio,
      duracao: slot.duracao.toString(),
      disciplina_id: slot.disciplina_id.toString(),
      docente_id: slot.docente_id.toString(),
      sala: slot.sala,
      color: slot.cor,
      type: slot.tipo,
      disciplina_nome: slot.disciplina_nome,
      docente_nome: slot.docente_nome
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Se for seleção de disciplina, atualiza também o nome
    if (name === 'disciplina_id') {
      const disciplina = disciplinas.find(d => d.id === parseInt(value));
      setCurrentSlot(prev => ({
        ...prev,
        disciplina_id: value,
        disciplina_nome: disciplina?.nome || ''
      }));
    } 
    // Se for seleção de docente, atualiza também o nome
    else if (name === 'docente_id') {
      const docente = docentesDisciplina.find(d => d.id === parseInt(value));
      setCurrentSlot(prev => ({
        ...prev,
        docente_id: value,
        docente_nome: docente?.nome || ''
      }));
    }
    else {
      setCurrentSlot(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const saveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, saving: true }));
    setError(null);

    try {
      const aulaData: AulaIn = {
        horario_id: horario_id,
        disciplina_id: parseInt(currentSlot.disciplina_id),
        docente_id: parseInt(currentSlot.docente_id),
        sala_id: 1, // Substitua pela lógica real para obter sala_id
        tipo: currentSlot.type,
        sala: currentSlot.sala,
        turma: parseInt(currentSlot.turma),
        dia_semana: parseInt(currentSlot.dia_semana),
        hora_inicio: currentSlot.hora_inicio,
        duracao: parseInt(currentSlot.duracao),
        cor: currentSlot.color
      };

      const response = await fetch('https://dsdeisi.pythonanywhere.com/api/horarios/aulas', {
        method: currentSlot.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aulaData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar aula');
      }

      const savedAula = await response.json();
      const newSlot = convertAulaToSlot(savedAula);

      setSlots(prev => 
        currentSlot.id
          ? prev.map(s => s.id === currentSlot.id ? newSlot : s)
          : [...prev, newSlot]
      );

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar aula');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const deleteSlot = async () => {
    if (!currentSlot.id) return;
    
    setLoading(prev => ({ ...prev, saving: true }));
    setError(null);

    try {
      const response = await fetch(`https://dsdeisi.pythonanywhere.com/api/horarios/horarios/aulas/${currentSlot.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir aula');
      }

      setSlots(prev => prev.filter(slot => slot.id !== currentSlot.id));
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir aula');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleClassSlotClick = (day: number, classId: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickedMinutes = Math.round(clickY / MINUTE_HEIGHT);
    const snappedMinutes = Math.floor(clickedMinutes / 30) * 30;
    const hours = START_HOUR + Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    openNewSlotModal(day, classId, startTime);
  };

  return (
    <div className={styles.container}>
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <div className={styles.timeColumn}></div>
            {DAYS.map(day => (
              <div key={`day-${day.id}`} className={styles.dayHeader}>
                <div className={styles.dayName}>{day.name}</div>
                <div className={styles.classColumns}>
                  {classes.map(cls => (
                    <div key={`class-${day.id}-${cls.id}`} className={styles.classColumn}>
                      {cls.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.calendarBody}>
            <div 
              className={styles.timeSlots} 
              style={{ height: `${CALENDAR_HEIGHT}px` }}
            >
              {generateTimeMarkers()}
            </div>
            
            <div 
              className={styles.daysContainer} 
              style={{ height: `${CALENDAR_HEIGHT}px` }}
            >
              {DAYS.map(day => (
                <div key={`day-${day.id}`} className={styles.dayColumn}>
                  {classes.map(cls => (
                    <div
                      key={`slot-${day.id}-${cls.id}`}
                      className={styles.classSlotColumn}
                      onClick={(e) => handleClassSlotClick(day.id, cls.id, e)}
                    >
                      {renderSlotsForDayAndClass(day.id, cls.id)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {modalOpen && (
        <div className={styles.modal} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{currentSlot.id ? 'Editar Aula' : 'Nova Aula'}</h3>
              <button onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={saveSlot}>
              <div className={styles.formGroup}>
                <label htmlFor="slot-dia-semana">Dia da semana</label>
                <select
                  id="slot-dia-semana"
                  name="dia_semana"
                  value={currentSlot.dia_semana}
                  onChange={handleInputChange}
                  required
                >
                  {DAYS.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.name}-feira
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-turma">Turma</label>
                <select
                  id="slot-turma"
                  name="turma"
                  value={currentSlot.turma}
                  onChange={handleInputChange}
                  required
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-hora-inicio">Hora de início</label>
                <select
                  id="slot-hora-inicio"
                  name="hora_inicio"
                  value={currentSlot.hora_inicio}
                  onChange={handleInputChange}
                  required
                >
                  {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
                    const hour = START_HOUR + i;
                    return [
                      <option key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </option>,
                      <option key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                        {`${hour.toString().padStart(2, '0')}:30`}
                      </option>
                    ];
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-duracao">Duração (minutos)</label>
                <select
                  id="slot-duracao"
                  name="duracao"
                  value={currentSlot.duracao}
                  onChange={handleInputChange}
                  required
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora e 30 minutos</option>
                  <option value="120">2 horas</option>
                  <option value="150">2 horas e 30 minutos</option>
                  <option value="180">3 horas</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-disciplina-id">Disciplina</label>
                <select
                  id="slot-disciplina-id"
                  name="disciplina_id"
                  value={currentSlot.disciplina_id}
                  onChange={handleInputChange}
                  required
                  disabled={loading.disciplinas}
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplinas.map(disciplina => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </option>
                  ))}
                </select>
                {loading.disciplinas && <span>Carregando disciplinas...</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-docente-id">Professor</label>
                <select
                  id="slot-docente-id"
                  name="docente_id"
                  value={currentSlot.docente_id}
                  onChange={handleInputChange}
                  required
                  disabled={!currentSlot.disciplina_id || docentesDisciplina.length === 0}
                >
                  <option value="">Selecione um professor</option>
                  {docentesDisciplina.map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nome}
                    </option>
                  ))}
                </select>
                {currentSlot.disciplina_id && docentesDisciplina.length === 0 && (
                  <span>Nenhum professor disponível para esta disciplina</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-type">Tipo de aula</label>
                <select
                  id="slot-type"
                  name="type"
                  value={currentSlot.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="T">Teórica</option>
                  <option value="P">Prática</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-sala">Sala</label>
                <input
                  type="text"
                  id="slot-sala"
                  name="sala"
                  value={currentSlot.sala}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-color">Cor</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="color"
                    id="slot-color"
                    name="color"
                    value={currentSlot.color}
                    onChange={handleInputChange}
                    required
                  />
                  <span 
                    className={styles.colorPreview}
                    style={{ backgroundColor: currentSlot.color }}
                  ></span>
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setModalOpen(false)}
                  disabled={loading.saving}
                >
                  Cancelar
                </button>
                {currentSlot.id && (
                  <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={deleteSlot}
                    disabled={loading.saving}
                  >
                    {loading.saving ? 'Excluindo...' : 'Excluir'}
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={loading.saving}
                >
                  {loading.saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;