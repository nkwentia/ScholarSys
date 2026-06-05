// src/lib/timetable-engine.ts
// Phase 3: Scheduling & I/O — Conflict-free timetable generation

import type { TimetableSlot, Teacher, AvailabilityMatrix, DayOfWeek, Period } from '@/types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS: Period[] = [1, 2, 3, 4, 5, 6, 7, 8];

export interface SlotRequest {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  sessions_per_week: number; // how many periods this subject needs per week
}

export interface ScheduleResult {
  slots: Omit<TimetableSlot, 'id'>[];
  conflicts: string[];
  unscheduled: SlotRequest[];
}

/**
 * Generate a conflict-free timetable given slot requests and teacher availability.
 * Uses a greedy constraint-satisfaction approach.
 */
export function generateTimetable(
  requests: SlotRequest[],
  teachers: Teacher[],
  academic_year: string,
  term: 1 | 2 | 3
): ScheduleResult {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Track occupied slots: key = "teacherId-day-period" or "classId-day-period"
  const teacherOccupied = new Set<string>();
  const classOccupied = new Set<string>();

  const slots: Omit<TimetableSlot, 'id'>[] = [];
  const conflicts: string[] = [];
  const unscheduled: SlotRequest[] = [];

  for (const req of requests) {
    const teacher = teacherMap.get(req.teacher_id);
    if (!teacher) {
      conflicts.push(`Teacher ${req.teacher_id} not found`);
      unscheduled.push(req);
      continue;
    }

    let scheduled = 0;

    for (const day of DAYS) {
      if (scheduled >= req.sessions_per_week) break;

      const availablePeriodsForDay: Period[] = teacher.availability[day] ?? PERIODS;

      for (const period of availablePeriodsForDay) {
        if (scheduled >= req.sessions_per_week) break;

        const teacherKey = `${req.teacher_id}-${day}-${period}`;
        const classKey = `${req.class_id}-${day}-${period}`;

        if (!teacherOccupied.has(teacherKey) && !classOccupied.has(classKey)) {
          teacherOccupied.add(teacherKey);
          classOccupied.add(classKey);

          slots.push({
            class_id: req.class_id,
            subject_id: req.subject_id,
            teacher_id: req.teacher_id,
            day,
            period,
            academic_year,
            term,
          });

          scheduled++;
        }
      }
    }

    if (scheduled < req.sessions_per_week) {
      unscheduled.push(req);
      conflicts.push(
        `Could only schedule ${scheduled}/${req.sessions_per_week} sessions for class ${req.class_id}, subject ${req.subject_id}`
      );
    }
  }

  return { slots, conflicts, unscheduled };
}

/**
 * Validate an existing timetable for conflicts.
 */
export function validateTimetable(slots: TimetableSlot[]): string[] {
  const errors: string[] = [];
  const teacherSlots = new Map<string, string[]>();
  const classSlots = new Map<string, string[]>();

  for (const slot of slots) {
    const key = `${slot.day}-${slot.period}`;
    const tKey = slot.teacher_id;
    const cKey = slot.class_id;

    if (!teacherSlots.has(tKey)) teacherSlots.set(tKey, []);
    if (!classSlots.has(cKey)) classSlots.set(cKey, []);

    if (teacherSlots.get(tKey)!.includes(key)) {
      errors.push(`Teacher ${slot.teacher_id} double-booked on ${slot.day} period ${slot.period}`);
    } else {
      teacherSlots.get(tKey)!.push(key);
    }

    if (classSlots.get(cKey)!.includes(key)) {
      errors.push(`Class ${slot.class_id} double-booked on ${slot.day} period ${slot.period}`);
    } else {
      classSlots.get(cKey)!.push(key);
    }
  }

  return errors;
}

/**
 * Build a printable grid structure from flat timetable slots.
 */
export function buildTimetableGrid(
  slots: TimetableSlot[],
  class_id: string
): Record<DayOfWeek, Record<Period, TimetableSlot | null>> {
  const grid = {} as Record<DayOfWeek, Record<Period, TimetableSlot | null>>;

  for (const day of DAYS) {
    grid[day] = {} as Record<Period, TimetableSlot | null>;
    for (const period of PERIODS) {
      grid[day][period] = null;
    }
  }

  for (const slot of slots) {
    if (slot.class_id === class_id) {
      grid[slot.day][slot.period] = slot;
    }
  }

  return grid;
}
