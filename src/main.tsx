import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Patch getComputedStyle globally to support parsing oklch colors in external libraries like html2canvas
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = function (element: Element, pseudoElt?: string | null): CSSStyleDeclaration {
  const style = originalGetComputedStyle(element, pseudoElt);
  
  const convertColorToRgb = (str: string): string => {
    if (typeof str !== 'string') return str;
    let result = str;

    if (result.includes('oklch')) {
      result = result.replace(/oklch\(([^)]+)\)/g, (_match, content) => {
        try {
          const parts = content.trim().split(/\s+/);
          const coords: string[] = [];
          let alpha = 1;
          let hasSlash = false;
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '/') {
              hasSlash = true;
              continue;
            }
            if (hasSlash) {
              if (part.endsWith('%')) {
                alpha = parseFloat(part) / 100;
              } else {
                alpha = parseFloat(part);
              }
            } else {
              coords.push(part);
            }
          }
          
          const L = parseFloat(coords[0] || '0');
          const C = parseFloat(coords[1] || '0');
          const hStr = coords[2] || '0';
          const H = parseFloat(hStr.replace('deg', ''));
          
          const hRad = (H * Math.PI) / 180;
          const a = C * Math.cos(hRad);
          const b = C * Math.sin(hRad);
          
          const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
          const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
          const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
          
          // safe power for negative bases
          const safePow3 = (val: number) => val < 0 ? -Math.pow(-val, 3) : Math.pow(val, 3);
          const l = safePow3(l_);
          const m = safePow3(m_);
          const s = safePow3(s_);
          
          const r_linear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
          const g_linear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
          const b_linear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
          
          const f = (val: number) => val <= 0.0031308 ? 12.92 * val : 1.055 * (Math.pow(Math.abs(val), 1 / 2.4)) * (val < 0 ? -1 : 1) - 0.055;
          
          const redVal = Math.round(Math.max(0, Math.min(1, f(r_linear))) * 255);
          const greenVal = Math.round(Math.max(0, Math.min(1, f(g_linear))) * 255);
          const blueVal = Math.round(Math.max(0, Math.min(1, f(b_linear))) * 255);
          
          if (alpha === 1) {
            return `rgb(${redVal}, ${greenVal}, ${blueVal})`;
          } else {
            return `rgba(${redVal}, ${greenVal}, ${blueVal}, ${alpha})`;
          }
        } catch {
          return 'rgb(99, 102, 241)';
        }
      });
    }

    if (result.includes('oklab')) {
      result = result.replace(/oklab\(([^)]+)\)/g, (_match, content) => {
        try {
          const parts = content.trim().split(/\s+/);
          const coords: string[] = [];
          let alpha = 1;
          let hasSlash = false;
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '/') {
              hasSlash = true;
              continue;
            }
            if (hasSlash) {
              if (part.endsWith('%')) {
                alpha = parseFloat(part) / 100;
              } else {
                alpha = parseFloat(part);
              }
            } else {
              coords.push(part);
            }
          }
          
          const L = parseFloat(coords[0] || '0');
          const a = parseFloat(coords[1] || '0');
          const b = parseFloat(coords[2] || '0');
          
          const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
          const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
          const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
          
          // safe power for negative bases
          const safePow3 = (val: number) => val < 0 ? -Math.pow(-val, 3) : Math.pow(val, 3);
          const l = safePow3(l_);
          const m = safePow3(m_);
          const s = safePow3(s_);
          
          const r_linear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
          const g_linear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
          const b_linear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
          
          const f = (val: number) => val <= 0.0031308 ? 12.92 * val : 1.055 * (Math.pow(Math.abs(val), 1 / 2.4)) * (val < 0 ? -1 : 1) - 0.055;
          
          const redVal = Math.round(Math.max(0, Math.min(1, f(r_linear))) * 255);
          const greenVal = Math.round(Math.max(0, Math.min(1, f(g_linear))) * 255);
          const blueVal = Math.round(Math.max(0, Math.min(1, f(b_linear))) * 255);
          
          if (alpha === 1) {
            return `rgb(${redVal}, ${greenVal}, ${blueVal})`;
          } else {
            return `rgba(${redVal}, ${greenVal}, ${blueVal}, ${alpha})`;
          }
        } catch {
          return 'rgb(99, 102, 241)';
        }
      });
    }

    return result;
  };

  return new Proxy(style, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return function(propertyName: string) {
          const value = target.getPropertyValue(propertyName);
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
            return convertColorToRgb(value);
          }
          return value;
        };
      }
      const value = Reflect.get(target, prop);
      if (typeof value === 'function') {
        return value.bind(target);
      }
      if (typeof prop === 'string' && typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
        return convertColorToRgb(value);
      }
      return value;
    }
  }) as any;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
