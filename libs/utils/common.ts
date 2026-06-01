// common.ts - Utility functions for API testing
import * as fs from 'fs';
import * as path from 'path';

export function createTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function timeInIso(): string {
  return new Date().toISOString();
}

export function timeInIsoShift(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function timeNow(): string {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
}

export function dateNow(): Date {
  return new Date();
}

export function dateOfNext(day: string): Date {
  const date = new Date(day);
  const today = new Date();
  const delta = date > today ? 0 : 7;
  date.setDate(date.getDate() + delta);
  return date;
}

export function dateShiftDays(daysNum: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysNum);
  return date;
}

export function dateToTimestamp(date: string): number {
  return Math.floor(new Date(date).getTime() / 1000);
}

export function convertToJson(object: any): any {
  if (typeof object === 'string') {
    try {
      return JSON.parse(object);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return object;
    }
  }
  return object;
}

export function readTestDataJson(filename: string): any {
  const fixturePath = path.join(__dirname, '../../test_data', filename);
  const fileContent = fs.readFileSync(fixturePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function readFixtureFile(filename: string): any {
  const fixturePath = path.join(__dirname, '../fixtures', filename);
  const fileContent = fs.readFileSync(fixturePath, 'utf-8');
  return JSON.parse(fileContent);
}
