/* סביבת jsdom לבדיקות הרכיבים (date-range-picker): matchers של jest-dom + matchMedia מדומה */
import '@testing-library/jest-dom/vitest';
import { installMatchMedia } from './viewport';

installMatchMedia();
