import { describe, it, expect } from 'vitest';
import {
  PASSPORT_GRID_PRESETS,
  calculateGridLayout,
  executePassportPhotoGrid,
} from './engine';

describe('passportPhotoGrid engine', () => {
  describe('PASSPORT_GRID_PRESETS specifications', () => {
    it('defines US Passport 2x2 layout with 6 photos on 4x6 sheet', () => {
      const us = PASSPORT_GRID_PRESETS.us_passport;
      expect(us.photoCount).toBe(6);
      expect(us.gridCols).toBe(3);
      expect(us.gridRows).toBe(2);
      expect(us.widthInches).toBe(2.0);
      expect(us.heightInches).toBe(2.0);
    });

    it('defines Schengen / EU 35x45mm layout with 8 photos on 4x6 sheet', () => {
      const eu = PASSPORT_GRID_PRESETS.schengen_eu;
      expect(eu.photoCount).toBe(8);
      expect(eu.gridCols).toBe(4);
      expect(eu.gridRows).toBe(2);
      expect(eu.widthMm).toBe(35.0);
      expect(eu.heightMm).toBe(45.0);
    });

    it('defines Indian Passport Seva 35x45mm layout with 8 photos', () => {
      const india = PASSPORT_GRID_PRESETS.india_passport;
      expect(india.photoCount).toBe(8);
      expect(india.gridCols).toBe(4);
      expect(india.gridRows).toBe(2);
    });
  });

  describe('calculateGridLayout', () => {
    it('calculates 300 DPI 4x6 sheet dimensions (1800 x 1200 px)', () => {
      const layout = calculateGridLayout('us_passport', 300);
      expect(layout.sheetWidth).toBe(1800);
      expect(layout.sheetHeight).toBe(1200);
      expect(layout.cells.length).toBe(6);
      expect(layout.cellWidth).toBe(600); // 2 inches * 300 DPI
      expect(layout.cellHeight).toBe(600);
      expect(layout.marginLeft).toBe(0);
      expect(layout.marginTop).toBe(0);
    });

    it('centers 35x45mm grid with symmetric margins on 4x6 sheet', () => {
      const layout = calculateGridLayout('schengen_eu', 300);
      expect(layout.sheetWidth).toBe(1800);
      expect(layout.sheetHeight).toBe(1200);
      expect(layout.cells.length).toBe(8);
      expect(layout.marginLeft).toBeGreaterThan(0);
      expect(layout.marginTop).toBeGreaterThan(0);

      // Verify cells stay within sheet bounds
      for (const cell of layout.cells) {
        expect(cell.x + cell.width).toBeLessThanOrEqual(layout.sheetWidth);
        expect(cell.y + cell.height).toBeLessThanOrEqual(layout.sheetHeight);
      }
    });
  });

  describe('executePassportPhotoGrid', () => {
    it('returns valid metadata without blob when no file is provided', async () => {
      const res = await executePassportPhotoGrid({ preset: 'us_passport' });
      expect(res.isValid).toBe(true);
      expect(res.photoCount).toBe(6);
      expect(res.sheetWidthPx).toBe(1800);
      expect(res.sheetHeightPx).toBe(1200);
      expect(res.dpi).toBe(300);
    });

    it('handles headless testing environment with dummy blob', async () => {
      const dummy = new Blob(['mock portrait'], { type: 'image/jpeg' });
      const res = await executePassportPhotoGrid({
        fileBlob: dummy,
        preset: 'schengen_eu',
      });
      expect(res.isValid).toBe(true);
      expect(res.photoCount).toBe(8);
      expect(res.sheetWidthPx).toBe(1800);
      expect(res.sheetHeightPx).toBe(1200);
    });
  });
});
