# TeacherAI · Asistente inteligente para docentes

Prototipo web funcional para preparar clases, organizar material educativo y generar propuestas pedagógicas con un asistente de IA.

La aplicación está construida con **React + TypeScript + Vite + Tailwind CSS** en el frontend y **Python 3.13 + FastAPI + SQLAlchemy + SQLite** en el backend. Gemini es opcional: si no existe una API Key, el asistente funciona con plantillas locales claramente identificadas como **demostración**.

---

## Funcionalidades implementadas

### Dashboard
- Bienvenida personalizada al docente.
- Métricas reales desde la base de datos: planificaciones, actividades, evaluaciones y preguntas.
- Accesos rápidos a los módulos.
- Últimas planificaciones registradas.
- Indicador del estado de la API y del modo del asistente.

### Planificaciones (CRUD completo)
- Crear, listar, consultar, editar y eliminar.
- Campos: título, asignatura, nivel, curso, tema, objetivo, duración, contenido, actividades, recursos y fecha.
- Búsqueda por título, tema o asignatura.
- Confirmación antes de eliminar.

### Actividades educativas
- Crear, listar, consultar y eliminar.
- Campos: título, asignatura, nivel, tema, descripción, tipo y duración estimada.
- Búsqueda y filtro por tipo.
- Confirmación antes de eliminar.

### Evaluaciones
- Crear cuestionarios con preguntas y opciones.
- Selección de la respuesta correcta por pregunta.
- Validación de mínimo 2 opciones, opciones no repetidas y respuesta válida.
- Listado, detalle con respuestas correctas resaltadas y eliminación en cascada.
- Confirmación antes de eliminar.

### Asistente TeacherAI
- Genera ideas de clase, actividades, preguntas, explicaciones y adaptaciones.
- Entradas: tema, asignatura, nivel educativo, tipo de contenido e indicaciones opcionales.
- Respuesta organizada y botón para copiar.
- **Modo demostración:** usa plantillas locales y muestra de forma explícita que **NO fue generado por Gemini**.
- **Integración real opcional con Gemini**, aislada en el backend y configurable por variables de entorno.
- Si Gemini está configurado pero falla, se devuelve un error claro; nunca se presenta una plantilla como si fuera Gemini.

### Experiencia de uso
- Interfaz responsive con sidebar, encabezado y tarjetas.
- Estados de carga, vacío y error.
- Toasts de éxito/error.
- Formularios con validación en cliente y servidor.
- Datos de ejemplo etiquetados como **Demostración**.
- Iconografía consistente con Lucide.

---

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Axios, Lucide |
| Backend | Python 3.13, FastAPI, SQLAlchemy 2, Pydantic 2, pydantic-settings |
| Base de datos | SQLite |
| IA | Gemini API (opcional) mediante el SDK oficial `google-genai` |
| Pruebas | pytest + FastAPI TestClient; typecheck y build de Vite |

No se utiliza Docker.

---

## Estructura del proyecto

```text
TeacherAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/          # health, dashboard, plans, activities, assessments, assistant
│   │   │   └── router.py
│   │   ├── core/config.py       # variables de entorno
│   │   ├── database/            # conexión, creación de tablas y datos demo
│   │   ├── models/              # Plan, Activity, Assessment, Question, QuestionOption
│   │   ├── schemas/             # esquemas Pydantic de entrada/salida
│   │   ├── services/            # plantillas demo y cliente Gemini
│   │   └── main.py              # aplicación FastAPI, CORS y manejo de errores
│   ├── tests/                   # pruebas de API
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/          # UI reutilizable, toasts, diálogos, tablas, tarjetas
│   │   ├── pages/               # Dashboard, Planes, Actividades, Evaluaciones, Asistente
│   │   ├── layouts/             # AppLayout, Sidebar, Header
│   │   ├── services/            # cliente Axios y llamadas por módulo
│   │   ├── hooks/               # carga de recursos de la API
│   │   ├── types/               # tipos TypeScript y constantes
│   │   ├── utils/               # formato, clases y portapapeles
│   │   └── styles/              # Tailwind y tema visual
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── README.md
└── .gitignore
```

---

## Requisitos

- Windows 10/11.
- Python 3.13 instalado y disponible con `py -3.13`.
- Node.js 20.19+ (probado con Node 24) y npm.
- PowerShell.

---

## Instalación y ejecución

### Terminal 1 · Backend

```powershell
cd D:\PROYETO_EXAMEN\TeacherAI\backend

# Solo la primera vez: crear entorno virtual con Python 3.13
py -3.13 -m venv .venv

# Activar el entorno virtual
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
python -m pip install --upgrade pip
pip install -r requirements.txt

# Crear configuración local (solo si no existe)
Copy-Item .env.example .env

# Ejecutar la API
uvicorn app.main:app --reload --port 8000
```

Si PowerShell bloquea la activación:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Terminal 2 · Frontend

```powershell
cd D:\PROYETO_EXAMEN\TeacherAI\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

### URLs

- Aplicación: <http://localhost:5173>
- API: <http://localhost:8000/api>
- Swagger: <http://localhost:8000/docs>
- Documentación OpenAPI: <http://localhost:8000/openapi.json>

> El proyecto ya incluye un entorno virtual y dependencias instaladas en esta máquina, pero los comandos anteriores permiten reproducirlo desde cero.

---

## Base de datos SQLite

- Archivo: **`backend/teacherai.db`**.
- Se crea automáticamente al iniciar el backend.
- La ruta relativa de `DATABASE_URL` se resuelve siempre dentro de `backend/`, sin depender de la carpeta desde la que se ejecute uvicorn.
- La base de datos persiste aunque se reinicie el servidor.
- Para reiniciar los datos: detén el backend, elimina `backend/teacherai.db` y vuelve a iniciar. Si `SEED_DEMO_DATA=true`, se recrearán las tablas y los ejemplos.
- Las pruebas usan una base SQLite temporal independiente.

### Datos de demostración

Con `SEED_DEMO_DATA=true` se cargan, solo si las tablas están vacías:

- 2 planificaciones.
- 2 actividades.
- 1 evaluación con 3 preguntas.

Todos los títulos incluyen **“(Demostración)”** y se muestran con una etiqueta visual. No sustituyen operaciones reales: se pueden editar o eliminar como cualquier otro registro.

---

## Configuración de Gemini

Edita `backend/.env`:

```env
GEMINI_API_KEY=tu_clave_aqui
GEMINI_MODEL=gemini-3.6-flash
```

- Integración mediante el SDK oficial `google-genai`; no se realizan llamadas REST manuales.
- Si `GEMINI_API_KEY` está vacía, el asistente usa **plantillas locales** y lo indica en la interfaz.
- Si la clave existe, el backend llama a Gemini; la respuesta se etiqueta como **“Generado con Gemini”**.
- La llamada se ejecuta fuera del event loop, con timeout de 45 segundos por intento y un máximo de 2 intentos para errores transitorios.
- Gemini recibe una instrucción de sistema especializada en pedagogía y el contenido solicitado.
- Los errores de autenticación, modelo no disponible, límite de solicitudes (429), timeout y conexión se traducen a mensajes seguros.
- La plantilla demo **no** se usa como reemplazo silencioso: si Gemini falla, se informa el error.
- La API Key solo se lee en el backend, nunca se envía al frontend ni se registra en los logs.
- No subas `.env` al repositorio. Solo `.env.example` debe versionarse.

---

## API REST

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado de la API, base de datos y modo de IA |
| GET | `/api/dashboard` | Métricas, últimas planificaciones y nombre del docente |
| GET | `/api/plans` | Lista planificaciones (filtros opcionales `q` y `subject`) |
| POST | `/api/plans` | Crea una planificación |
| GET | `/api/plans/{id}` | Detalle de una planificación |
| PUT | `/api/plans/{id}` | Actualiza una planificación |
| DELETE | `/api/plans/{id}` | Elimina una planificación |
| GET | `/api/activities` | Lista actividades (filtro opcional `q`) |
| POST | `/api/activities` | Crea una actividad |
| GET | `/api/activities/{id}` | Detalle de una actividad |
| DELETE | `/api/activities/{id}` | Elimina una actividad |
| GET | `/api/assessments` | Lista evaluaciones con número de preguntas |
| POST | `/api/assessments` | Crea una evaluación con preguntas y opciones |
| GET | `/api/assessments/{id}` | Detalle de una evaluación |
| DELETE | `/api/assessments/{id}` | Elimina una evaluación y sus preguntas |
| POST | `/api/assistant/generate` | Genera contenido con Gemini o plantilla demo |

CORS está habilitado para `http://localhost:5173` y `http://127.0.0.1:5173`.

### Ejemplo del asistente

```json
{
  "topic": "Fracciones equivalentes",
  "subject": "Matemática",
  "education_level": "Primaria",
  "content_type": "ideas",
  "additional_instructions": "Trabajar en parejas durante 20 minutos."
}
```

Respuesta en modo demo:

```json
{
  "content": "MODO DEMOSTRACIÓN · PLANTILLA LOCAL...",
  "source": "demo",
  "model": null,
  "notice": "Modo demostración: respuesta generada con una plantilla local de TeacherAI. NO fue generada por Gemini.",
  "generated_at": "2026-10-31T03:20:00+00:00"
}
```

---

## Pruebas y comprobaciones

### Backend

```powershell
cd D:\PROYETO_EXAMEN\TeacherAI\backend
.\.venv\Scripts\python.exe -m pytest -q
```

Resultado obtenido: **29 pruebas superadas**. Cubren health, dashboard, CRUD de planificaciones, actividades, evaluaciones, validaciones, asistente demo, SDK de Gemini, prompts, timeouts y traducción de errores.

### Frontend

```powershell
cd D:\PROYETO_EXAMEN\TeacherAI\frontend
npm run typecheck
npm run build
```

`npm run typecheck` y `npm run build` finalizaron correctamente.

### Verificación de integración

Se comprobó con el backend y el frontend en ejecución:

- `/api/health` responde `status: ok` y `assistant_mode: gemini`.
- `/api/dashboard` devuelve los conteos reales de SQLite.
- Las cabeceras CORS permiten el origen del frontend.
- El asistente responde con `source: demo` y aviso explícito cuando no hay clave.
- La persistencia se verificó creando un registro, reiniciando el backend y consultándolo de nuevo.
- Prueba de navegador automatizada (Edge headless) sin errores inesperados de JavaScript:
  - dashboard con datos reales,
  - crear, editar y eliminar planificación,
  - crear y eliminar actividad,
  - crear y eliminar evaluación,
  - generar contenido demo en el asistente,
  - navegación responsive en móvil.
- Prueba real con Gemini (`gemini-3.6-flash`):
  - actividad de Matemática para Secundaria generada correctamente,
  - respuesta recibida y renderizada en React con la etiqueta “Generado con Gemini”,
  - copiado al portapapeles verificado,
  - manejo visual del error 429 verificado,
  - 0 errores de página y 0 errores inesperados de consola.
- El proveedor puede devolver `503 UNAVAILABLE` por alta demanda; el servicio reintenta una vez y, si persiste, muestra un mensaje seguro sin usar la plantilla demo como sustituto.

---

## Variables de entorno

### Backend (`backend/.env.example`)

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `APP_NAME` | `TeacherAI` | Nombre de la API |
| `APP_VERSION` | `0.1.0` | Versión mostrada |
| `ENVIRONMENT` | `development` | Entorno |
| `DATABASE_URL` | `sqlite:///./teacherai.db` | Ruta SQLite |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Orígenes permitidos |
| `TEACHER_NAME` | `Docente` | Nombre del dashboard |
| `SEED_DEMO_DATA` | `true` | Carga ejemplos si las tablas están vacías |
| `GEMINI_API_KEY` | vacío | Clave opcional de Gemini |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Modelo a utilizar |

### Frontend (`frontend/.env.example`)

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8000/api` | URL base de la API |

---

## Seguridad

- La entrega **no incluye** `backend/.env` ni ninguna API Key. Si ese archivo no existe, la aplicación arranca con valores seguros por defecto y en **modo demostración**.
- Las claves se leen solo desde `backend/.env`, que está en `.gitignore`.
- `.env.example` debe contener únicamente valores vacíos o de ejemplo; nunca una clave real.
- Si una clave se expone accidentalmente en un archivo, repositorio o conversación, revócala y genera una nueva.
- El frontend no contiene secretos.
- Se validan entradas con Pydantic y formularios.
- Los errores de base de datos no exponen detalles internos.
- Los errores de Gemini se registran sin incluir la clave.
- Los registros de demostración están marcados en la base de datos y en la interfaz.

---

## Funcionalidades pendientes / fuera del alcance del MVP

- Autenticación y multiusuario (roles de docente, coordinador, administrador).
- Edición de actividades y evaluaciones (el MVP permite crearlas, consultarlas y eliminarlas).
- Paginación y ordenamiento avanzado para listas grandes.
- Exportación a PDF/Word e impresión de planificaciones y evaluaciones.
- Banco de preguntas reutilizable y tipos avanzados (respuesta abierta, emparejamiento, etc.).
- Adjuntar archivos o imágenes a las planificaciones.
- Historial de versiones y papelera de reciclaje.
- Streaming de respuestas largas y cancelación manual desde la interfaz.

---

## Solución de problemas

- **“No se pudo conectar con el servidor”**: confirma que el backend está en `http://localhost:8000` y el frontend en `http://localhost:5173`.
- **Error de CORS**: verifica que la URL del navegador sea `localhost` o `127.0.0.1` y que `CORS_ORIGINS` incluya ese origen.
- **PowerShell no activa el entorno virtual**: ejecuta `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
- **El puerto está ocupado**: cambia el puerto de uvicorn y actualiza `VITE_API_URL`, o detén el proceso que lo ocupa. Vite usa el puerto 5173 de forma estricta.
- **Quiero empezar de cero**: elimina `backend/teacherai.db` y reinicia el backend con `SEED_DEMO_DATA=true`.

---

Proyecto universitario · TeacherAI · 2026
