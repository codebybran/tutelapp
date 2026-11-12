# Tutelapp

Aplicación web para redactar una **acción de tutela** en Colombia. Está hecha solo con HTML, CSS y JavaScript: no tiene backend y **no guarda ni envía datos**. Todo ocurre en el navegador.

> ⚠️ Herramienta educativa: no reemplaza la asesoría de un abogado.

## Cómo usarla

1. Abre `index.html` en cualquier navegador (también funciona en el celular).
2. Llena el formulario por secciones.
3. Pulsa **Generar tutela**.
4. Revisa el texto y usa **Copiar texto** o **Descargar PDF** (en la ventana de impresión elige “Guardar como PDF”).

No necesita instalación ni conexión a internet.

## Secciones del formulario

1. **Quién presenta la tutela**: nombres, documento, ciudad, dirección, correo, teléfono; a nombre propio o en representación de otra persona.
2. **Contra quién**: nombre y tipo de la accionada. Muestra el reparto según el **Decreto 333 de 2021**:
   - Jueces **municipales**: EPS, entidades municipales o departamentales y particulares.
   - Jueces **del circuito**: entidades públicas nacionales.
3. **Derechos vulnerados**: salud, vida digna, seguridad social, mínimo vital, petición, debido proceso, igualdad u otro.
4. **Hechos**: uno por línea; se numeran solos.
5. **Pretensiones**: una por línea (PRIMERA, SEGUNDA…).
6. **Medida provisional** (opcional, art. 7 del Decreto 2591 de 1991).
7. **Pruebas y anexos**: uno por línea.
8. **Juramento** obligatorio (art. 37 del Decreto 2591 de 1991).

Antes de generar, la app valida los campos obligatorios y señala los que faltan.

## Documento generado

Incluye: encabezado “Señor(a) Juez (Reparto)”, referencia, presentación de las partes, hechos numerados, derechos vulnerados, fundamentos de derecho, pretensiones, medida provisional (si aplica), pruebas, juramento, notificaciones y firma.

Fundamentos de derecho:

- Artículo 86 de la Constitución Política.
- Artículos 1, 5, 14 y 37 del Decreto 2591 de 1991 (y el 7 si se pide medida provisional).
- Ley 1751 de 2015, si se marca **salud**.
- Artículo 23 de la Constitución y Ley 1755 de 2015, si se marca **petición**.
- Decreto 333 de 2021 (reparto).

## Archivos

| Archivo      | Contenido                                        |
|--------------|--------------------------------------------------|
| `index.html` | Estructura del formulario y del resultado        |
| `styles.css` | Diseño oscuro, adaptable al celular, e impresión |
| `app.js`     | Validación, reparto y redacción del documento    |
| `README.md`  | Este archivo                                     |

## Privacidad

No hay servidor, cookies, `localStorage` ni analítica. Al cerrar o recargar la página, los datos desaparecen.
