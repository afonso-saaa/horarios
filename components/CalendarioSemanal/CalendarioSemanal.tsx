'use client';

import { useState, useEffect } from 'react';
import styles from './CalendarioSemanal.module.css';


type ClassType = {
  id: number;
  name: string;
};

interface Slot {
  id: number;
  day: number;
  class: number;
  startTime: string;
  duration: number;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  type: string;
}

interface SlotForm {
  id: number | null;
  day: string;
  class: string;
  startTime: string;
  duration: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  type: string;
}

const WeeklyCalendar = () => {

  const [classCount, setClassCount] = useState(3);
  const [classPrefix, setClassPrefix] = useState("Turma");
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, day: 1, class: 1, startTime: '14:00', duration: 90, subject: 'Fundamentos de Programação', teacher: 'Pedro Alves', room: 'Sala 101', color: '#3a87ad', type: 'Teórica' },
    // ... outros slots permanecem iguais
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<SlotForm>({
    id: null,
    day: '1',
    class: '1',
    startTime: '08:00',
    duration: '60',
    subject: '',
    teacher: '',
    room: '',
    color: '#3a87ad',
    type: 'Teórica'
  });

  const HOUR_HEIGHT = 60; // Aumentei para melhor visualização
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

  // Inicializa as turmas
  useEffect(() => {
    const newClasses = [];
    for (let i = 1; i <= classCount; i++) {
      newClasses.push({ id: i, name: `${classPrefix} ${i}` });
    }
    setClasses(newClasses);
  }, [classCount, classPrefix]);

  const calculateSlotPosition = (startTime: string): number => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours - START_HOUR) * 60 + minutes;
    return totalMinutes * MINUTE_HEIGHT;
  };

  const renderSlotsForDayAndClass = (dayId: number, classId: number) => {
    return slots
      .filter(slot => slot.day === dayId && slot.class === classId)
      .map(slot => {
        const top = calculateSlotPosition(slot.startTime);
        const height = slot.duration * MINUTE_HEIGHT;
        
        return (
          <div
            key={slot.id}
            className={styles.slot}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              backgroundColor: slot.color
            }}
            onClick={(e) => {
              e.stopPropagation();
              openEditSlotModal(slot);
            }}
          >
            <div className={styles.slotTitle}>{slot.subject}</div>
            <div className={styles.slotDetails}>{slot.teacher} - {slot.room}</div>
            <div className={styles.slotDetails}><em>{slot.type}</em></div>
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

  const openNewSlotModal = (  day: number, classId: number, startTime?: string) => {
    setCurrentSlot({
      id: null,
      day: day.toString(),
      class: classId.toString(),
      startTime: startTime || '08:00',
      duration: '60',
      subject: '',
      teacher: '',
      room: '',
      color: '#3a87ad',
      type: 'Teórica',
    });
    setModalOpen(true);
  };

  const openEditSlotModal = (slot: Slot): void => {
    setCurrentSlot({
      id: slot.id,
      day: slot.day.toString(),
      class: slot.class.toString(),
      startTime: slot.startTime,
      duration: slot.duration.toString(),
      subject: slot.subject,
      teacher: slot.teacher,
      room: slot.room,
      color: slot.color,
      type: slot.type || 'Teórica',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSlot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSlot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Garantir que o ID seja sempre número
    const newId = currentSlot.id ?? Date.now();
    
    const slotData: Slot = {
      id: newId,
      day: parseInt(currentSlot.day),
      class: parseInt(currentSlot.class),
      startTime: currentSlot.startTime,
      duration: parseInt(currentSlot.duration),
      subject: currentSlot.subject,
      teacher: currentSlot.teacher,
      room: currentSlot.room,
      color: currentSlot.color,
      type: currentSlot.type
    };

    setSlots(prev => 
      currentSlot.id !== null
        ? prev.map(s => s.id === currentSlot.id ? slotData : s)
        : [...prev, slotData]
    );

    closeModal();
  };


  const deleteSlot = () => {
    setSlots(prev => prev.filter(slot => slot.id !== currentSlot.id));
    closeModal();
  };

  const generateStartTimeOptions = () => {
    const options = [];
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
      options.push(
        <option key={`full-${hour}`} value={`${hour.toString().padStart(2, '0')}:00`}>
          {`${hour.toString().padStart(2, '0')}:00`}
        </option>
      );
      if (hour < END_HOUR) {
        options.push(
          <option key={`half-${hour}`} value={`${hour.toString().padStart(2, '0')}:30`}>
            {`${hour.toString().padStart(2, '0')}:30`}
          </option>
        );
      }
    }
    return options;
  };

  const handleClassSlotClick = (  day: number, classId: number, e: React.MouseEvent<HTMLDivElement>) => {
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
      {/* ... (cabeçalho e controles permanecem iguais) ... */}
      
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <div className={styles.timeColumn}></div>
            {DAYS.map(day => (
              <div key={day.id} className={styles.dayHeader}>
                <div className={styles.dayName}>{day.name}</div>
                <div className={styles.classColumns}>
                  {classes.map(cls => (
                    <div key={`header-${day.id}-${cls.id}`} className={styles.classColumn}>
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
              <input type="hidden" name="id" value={currentSlot.id || ''} />
              
              <div className={styles.formGroup}>
                <label htmlFor="slot-day">Dia da semana</label>
                <select
                  id="slot-day"
                  name="day"
                  value={currentSlot.day}
                  onChange={handleInputChange}
                  required
                >
                  {DAYS.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.name}feira
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-class">Turma</label>
                <select
                  id="slot-class"
                  name="class"
                  value={currentSlot.class}
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
                <label htmlFor="slot-start-time">Hora de início</label>
                <select
                  id="slot-start-time"
                  name="startTime"
                  value={currentSlot.startTime}
                  onChange={handleInputChange}
                  required
                >
                  {generateStartTimeOptions()}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-duration">Duração (minutos)</label>
                <select
                  id="slot-duration"
                  name="duration"
                  value={currentSlot.duration}
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
                <label htmlFor="slot-subject">Disciplina</label>
                <input
                  type="text"
                  id="slot-subject"
                  name="subject"
                  value={currentSlot.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-teacher">Professor</label>
                <input
                  type="text"
                  id="slot-teacher"
                  name="teacher"
                  value={currentSlot.teacher}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="slot-room">Sala</label>
                <input
                  type="text"
                  id="slot-room"
                  name="room"
                  value={currentSlot.room}
                  onChange={handleInputChange}
                  required
                />
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
                  <option value="Teórica">Teórica</option>
                  <option value="Prática">Prática</option>
                </select>
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

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                {currentSlot.id && (
                  <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={deleteSlot}
                  >
                    Excluir
                  </button>
                )}
                <button 
                  type="submit" 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Salvar
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